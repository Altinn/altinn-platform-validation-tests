import { fail, group, sleep } from "k6";

import {
    GetInstanceDelegationCheckQueryBuilder,
    GetResourceDelegationCheckQueryBuilder,
} from "../../../../clients/access-management/enduser/connections/index.js";
import {
    GetResourceRightsQueryBuilder,
    ServiceOwnerResourceDelegationBuilder,
} from "../../../../clients/access-management/service-owner/connections/index.js";
import {
    AccessListMembersBuilder,
    AccessListResourceConnectionBuilder,
    CreateAccessListBuilder,
} from "../../../../clients/resource-registry/index.js";
import { uuidv4 } from "../../../../common-imports.js";
import { getOptions } from "../../../../helpers.js";
import {
    GetInstanceDelegationCheck,
    GetResourceDelegationCheck,
} from "../../../building-blocks/access-management/enduser/connections/index.js";
import {
    ConnectionsCreateResource,
    ConnectionsGetResourceRights,
    ConnectionsRevokeResource,
} from "../../../building-blocks/access-management/service-owner/connections/index.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListDelete,
    AccessListsUpsertResourceConnection,
} from "../../../building-blocks/resource-registry/access-lists/index.js";
import {
    DelegationCheckReasonCode,
    ResourceDelegationDomainChecks,
} from "../../../domain-checks/access-management/resource-delegation.js";
import { ConnectionsDomainChecks } from "../../../domain-checks/access-management/service-owner/connections.js";
import { getAccessListClient } from "../../resource-registry/commons.js";
import { getEnduserClients, getEnduserTokenOpts, getServiceOwnerClients, setup as commonSetup } from "./common.js";
import { DELEGABLE_ACCESS_LIST_RESOURCE, OWNER } from "./resources.js";

const notOnListLabel = { step: "1. Organization on no list is refused" };
const createListLabel = { step: "2a. Put the organization on a list" };
const onListLabel = { step: "2b. Organization on the list is allowed" };
const delegateLabel = { step: "2c. Service owner delegates from the organization on the list" };
const lowerCaseFilterLabel = { step: "3. List limited to read" };
const upperCaseFilterLabel = { step: "4. List limited to READ" };
const deleteListLabel = { step: "5. Delete the list and the organization is refused again" };
const cleanupLabel = { step: "Cleanup" };

/**
 * The decision point caches access list memberships for ten minutes
 * (PolicyCacheTimeout), separately in every pod, and Access Management asks it
 * for every access list check. After a change to a list, the pods disagree until
 * their entries run out, so every change here is followed by a wait just past
 * that, and the delegation checks are then asked several times over.
 */
const CACHE_WAIT_SECONDS = 11 * 60;
const SAMPLES = 3;

// Five waits of eleven minutes do not fit in k6's default ten minute limit, and
// maxDuration can only be raised on a scenario. VUs and iterations are left
// out: shared-iterations defaults to one VU and one iteration, which is what a
// by-hand run of this test is.
export const options = {
    ...getOptions([
        notOnListLabel,
        createListLabel,
        onListLabel,
        delegateLabel,
        lowerCaseFilterLabel,
        upperCaseFilterLabel,
        deleteListLabel,
        cleanupLabel,
    ]),
    scenarios: {
        default: {
            executor: "shared-iterations",
            maxDuration: "80m",
        },
    },
};

/**
 * The list this test puts the organization on. Fixed rather than fresh per
 * run, so a run that died halfway leaves one list behind at most, which the next
 * run and teardown both delete.
 */
const LIST_ID = "k6-local-resource-data-membership";

/**
 * Reads the test data, and makes sure the organization this test puts on a
 * list is not the one the scheduled tests use as an outsider.
 *
 * @returns {ReturnType<typeof commonSetup>} The test data.
 */
export function setup() {
    const data = commonSetup();

    if (data.users.length < 2) {
        fail("access-list-membership.js needs two rows: it puts the last one on a list, and the scheduled tests use the first as an outsider.");
    }

    return data;
}

/**
 * Asks both delegation checks SAMPLES times and hands each answer to the check.
 *
 * @param {ReturnType<typeof setup>["users"][number]} member The daglig leder of the organization.
 * @param {{[key: string]: string}} label k6 request label.
 * @param {(resourceCheck: *, operation: string) => boolean} checkAnswer The domain check to run on each answer.
 * @returns {void}
 */
function askRepeatedly(member, label, checkAnswer) {
    const { connections } = getEnduserClients();

    for (let i = 0; i < SAMPLES; i++) {
        checkAnswer(
            GetResourceDelegationCheck(
                connections,
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(member.orgUuid)
                    .withResource(DELEGABLE_ACCESS_LIST_RESOURCE)
                    .build(),
                label,
            ),
            "GetResourceDelegationCheck",
        );

        checkAnswer(
            GetInstanceDelegationCheck(
                connections,
                new GetInstanceDelegationCheckQueryBuilder()
                    .withParty(member.orgUuid)
                    .withResource(DELEGABLE_ACCESS_LIST_RESOURCE)
                    .withInstance(`urn:altinn:dialog-id:${uuidv4()}`)
                    .build(),
                label,
            ),
            "GetInstanceDelegationCheck",
        );

        sleep(5);
    }
}

/**
 * Deletes the list if it is there, without counting a missing one as a failure.
 *
 * @param {{[key: string]: string}} label k6 request label.
 * @returns {void}
 */
function deleteListIfThere(label) {
    getAccessListClient(OWNER.orgcode, OWNER.orgno).AccessListDelete(OWNER.orgcode, LIST_ID, {}, label);
}

/**
 * Test: the delegation check follows an organization on and off an access list
 * (Altinn/altinn-auth#4786, #4789).
 *
 * The counterpart of access-list-delegation-check.js, which only covers an
 * organization on no list. Here the organization is put on one and taken off
 * again, on k6-access-list-resource:
 *
 * 1. On no list, every right is refused for AccessListValidationFail.
 * 2. On a list with no action filter, every right is delegable, and the service
 * owner can delegate from the organization (revoked straight after).
 * 3. On a list limited to "read", read is delegable and write is refused for
 * AccessListValidationFail.
 * 4. The same with "READ": action filters match regardless of case since
 * Altinn/altinn-auth#4925 fixed #4765.
 *
 * Steps 3 and 4 failed in at22 and at23 on 2026-11-16: with any action filter on
 * the list, both read and write were refused. The delegation check sends the
 * action to the decision point as its full URN
 * (urn:oasis:names:tc:xacml:1.0:action:action-id:read, from
 * rightKey.Action.Urn() in ConnectionService), while the filter holds "read", so
 * the two never match. Not reported yet when this was written, and not fixed by
 * PR #4831, which sends the plain action value only on its own path.
 * 5. With the list deleted, every right is refused again.
 *
 * Every step waits CACHE_WAIT_SECONDS first, so a run takes about an hour. Not
 * scheduled: run it by hand before and after #4789 is deployed in each
 * environment.
 *
 * The organization is the last row of the test data, never the first, which the
 * scheduled tests rely on being on no list.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const member = data.users[data.users.length - 1];
    const recipient = data.users[0];
    const accessLists = getAccessListClient(OWNER.orgcode, OWNER.orgno);
    const serviceOwner = getServiceOwnerClients();

    getEnduserClients().tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(member));

    const refusedByList = (/** @type {*} */ resourceCheck, /** @type {string} */ operation) =>
        ResourceDelegationDomainChecks.CheckDelegationCheckRefused(resourceCheck, DelegationCheckReasonCode.AccessListValidationFail, operation);
    const onlyRead = (/** @type {*} */ resourceCheck, /** @type {string} */ operation) =>
        ResourceDelegationDomainChecks.CheckDelegationCheckActions(resourceCheck, ["read"], DelegationCheckReasonCode.AccessListValidationFail, operation);

    group(notOnListLabel.step, function () {
        // A run that died halfway may have left the list, and the cache may
        // still remember an earlier run's membership.
        deleteListIfThere(cleanupLabel);
        sleep(CACHE_WAIT_SECONDS);
        askRepeatedly(member, notOnListLabel, refusedByList);
    });

    group(createListLabel.step, function () {
        AccessListCreateOrUpdate(accessLists, OWNER.orgcode, LIST_ID, new CreateAccessListBuilder()
            .withName(`k6 local resource data ${LIST_ID}`)
            .withDescription("Created by local-resource-data/access-list-membership.js")
            .build(), createListLabel);
        AccessListsUpsertResourceConnection(accessLists, OWNER.orgcode, LIST_ID, DELEGABLE_ACCESS_LIST_RESOURCE,
            new AccessListResourceConnectionBuilder().build(), createListLabel);
        AccessListAddMembers(accessLists, OWNER.orgcode, LIST_ID,
            new AccessListMembersBuilder().withOrganization(member.orgNo).build(), createListLabel);
    });

    group(onListLabel.step, function () {
        sleep(CACHE_WAIT_SECONDS);
        askRepeatedly(member, onListLabel, (resourceCheck, operation) =>
            ResourceDelegationDomainChecks.CheckDelegationCheckGranted(resourceCheck, operation));
    });

    group(delegateLabel.step, function () {
        const rights = ConnectionsGetResourceRights(
            serviceOwner.connections,
            new GetResourceRightsQueryBuilder().WithResource(DELEGABLE_ACCESS_LIST_RESOURCE).Build(),
            delegateLabel,
        );

        if (!ConnectionsDomainChecks.CheckDelegableRightsFound(rights, DELEGABLE_ACCESS_LIST_RESOURCE)) {
            return;
        }

        const builder = () => new ServiceOwnerResourceDelegationBuilder()
            .WithFromOrganization(member.orgNo)
            .WithToPerson(recipient.pid)
            .WithResource(DELEGABLE_ACCESS_LIST_RESOURCE);

        const created = ConnectionsCreateResource(
            serviceOwner.connections,
            builder().WithRightKeys({ directRightKeys: rights.map((right) => right.key).filter((key) => key !== null) }).Build(),
            delegateLabel,
        );

        if (ConnectionsDomainChecks.CheckResourceDelegationCreated(created)) {
            ConnectionsRevokeResource(serviceOwner.connections, builder().Build(), cleanupLabel);
        }
    });

    group(lowerCaseFilterLabel.step, function () {
        AccessListsUpsertResourceConnection(accessLists, OWNER.orgcode, LIST_ID, DELEGABLE_ACCESS_LIST_RESOURCE,
            new AccessListResourceConnectionBuilder().withActionFilters(["read"]).build(), lowerCaseFilterLabel);
        sleep(CACHE_WAIT_SECONDS);
        askRepeatedly(member, lowerCaseFilterLabel, onlyRead);
    });

    group(upperCaseFilterLabel.step, function () {
        AccessListsUpsertResourceConnection(accessLists, OWNER.orgcode, LIST_ID, DELEGABLE_ACCESS_LIST_RESOURCE,
            new AccessListResourceConnectionBuilder().withActionFilters(["READ"]).build(), upperCaseFilterLabel);
        sleep(CACHE_WAIT_SECONDS);
        askRepeatedly(member, upperCaseFilterLabel, onlyRead);
    });

    group(deleteListLabel.step, function () {
        AccessListDelete(accessLists, OWNER.orgcode, LIST_ID, deleteListLabel);
        sleep(CACHE_WAIT_SECONDS);
        askRepeatedly(member, deleteListLabel, refusedByList);
    });
}

/**
 * Deletes the list whatever happened during the run.
 *
 * @returns {void}
 */
export function teardown() {
    deleteListIfThere(cleanupLabel);
}
