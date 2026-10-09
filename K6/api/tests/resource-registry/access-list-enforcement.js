import { fail, group } from "k6";

import { AccessListMembersBuilder, AccessListResourceConnectionBuilder, CreateAccessListBuilder } from "../../../clients/resource-registry/index.js";
import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import { AuthorizePost } from "../../building-blocks/authorization/authorize/post.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListsGetResourceConnections,
    AccessListsUpsertResourceConnection,
} from "../../building-blocks/resource-registry/access-lists/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import { getAuthorizeClient } from "../authorization/authorize-client.js";
import { buildDaglRequest } from "../authorization/pdp-authorize/common-functions.js";
import {
    deleteTestListsOf,
    getAccessListClient,
    getEnforcedResources,
    getOrganizationsWithDailyManager,
    newIdentifier,
    newRunId,
} from "./commons.js";

const createLabel = { step: "Create the access list for the resource owner" };
const connectLabel = { step: "Connect the resource and read it back" };
const memberLabel = { step: "Add organization A as a member" };
const permitLabel = { step: "Daglig leder of organization A is permitted" };
const denyLabel = { step: "Daglig leder of organization B is denied" };

export const options = getOptions([createLabel, connectLabel, memberLabel, permitLabel, denyLabel]);

/**
 * Reads the test data once and draws the run id for the list identifiers.
 *
 * The organizations are split in two halves: members come from the first and
 * outsiders from the second. The decision point caches its answers for a
 * while, so an organization that was a member in a run a few minutes ago can
 * still be permitted after that run deleted its list. Keeping outsiders out of
 * the member half means organization B has never been on a list, and its Deny
 * says something about this run.
 *
 * @returns {{runId: string, resources: Array<import("./commons.js").Resource>, members: Array<import("./commons.js").OrganizationWithDailyManager>, outsiders: Array<import("./commons.js").OrganizationWithDailyManager>}} The test data.
 */
export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "AUTHORIZATION_SUBSCRIPTION_KEY"]);

    const organizations = getOrganizationsWithDailyManager();
    const half = Math.ceil(organizations.length / 2);

    return {
        runId: newRunId(),
        resources: getEnforcedResources(),
        members: organizations.slice(0, half),
        outsiders: organizations.slice(half),
    };
}

/**
 * Test: an access list decides who gets to use a resource.
 *
 * The resource owner creates a list, connects a resource whose access lists
 * the registry enforces, and adds organization A. The policy decision point
 * then permits A's daglig leder on behalf of A and denies B's daglig leder on
 * behalf of B, who is not on the list. Both people hold the role the policy
 * grants, so the list is the only thing that tells them apart.
 *
 * The decision point answers 200 either way; Permit stands for the 200 and Deny
 * for the 403 a service would give the two organizations.
 *
 * The create, the connection and the membership end the iteration with fail()
 * when they do not hold, since the decisions mean nothing without them.
 * Teardown deletes the list either way.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 */
export default function (data) {
    const { owner, ownerOrgNo, resourceId, actions } = getItemFromList(data.resources);
    const action = actions[0] ?? fail(`cannot continue: ${resourceId} has no actions in the test data`);
    const organizationA = getItemFromList(data.members);
    const organizationB = getItemFromList(data.outsiders);
    const client = getAccessListClient(owner, ownerOrgNo);
    const [authorizeClient] = getAuthorizeClient();
    const identifier = newIdentifier(data.runId);
    const written = {
        owner,
        identifier,
        name: `k6 enforcement ${identifier}`,
        description: "Created by the resource-registry access list enforcement test",
    };

    group("Create the access list for the resource owner", function () {
        const created = AccessListCreateOrUpdate(client, owner, identifier, new CreateAccessListBuilder()
            .withName(written.name)
            .withDescription(written.description)
            .build(), null, createLabel);

        if (!AccessListDomainChecks.CheckAccessListInfo(created.value, written, "AccessListCreateOrUpdate")) {
            fail("cannot continue: the access list was not created as written");
        }
    });

    group("Connect the resource and read it back", function () {
        // No action filter, so membership gives whatever the policy grants.
        AccessListsUpsertResourceConnection(client, owner, identifier, resourceId, new AccessListResourceConnectionBuilder().build(), null, connectLabel);

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, connectLabel);

        if (!AccessListDomainChecks.CheckResourceConnections(connections?.data, [{ resourceIdentifier: resourceId, actionFilters: null }], "AccessListsGetResourceConnections")) {
            fail(`cannot continue: the list does not hold ${resourceId}, so the decisions would not be about it`);
        }
    });

    group("Add organization A as a member", function () {
        const added = AccessListAddMembers(client, owner, identifier, new AccessListMembersBuilder()
            .withOrganization(organizationA.orgno)
            .build(), memberLabel);

        if (!AccessListDomainChecks.CheckMembers(added, [organizationA.orgno], "AccessListAddMembers")) {
            fail("cannot continue: organization A is not on the list");
        }
    });

    group("Daglig leder of organization A is permitted", function () {
        AuthorizePost(
            authorizeClient,
            buildDaglRequest(organizationA.ssn, organizationA.orgno, resourceId, action),
            "Permit",
            permitLabel,
        );
    });

    group("Daglig leder of organization B is denied", function () {
        AuthorizePost(
            authorizeClient,
            buildDaglRequest(organizationB.ssn, organizationB.orgno, resourceId, action),
            "Deny",
            denyLabel,
        );
    });
}

/**
 * Deletes the list this run created, and stale k6- leftovers.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 */
export function teardown(data) {
    const deleted = deleteTestListsOf(data.resources, data.runId);

    if (deleted > 0) {
        console.info(`teardown - deleted ${deleted} access list(s)`);
    }
}
