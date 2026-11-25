import { check } from "k6";
import { Counter } from "k6/metrics";

import { GetResourceDelegationCheckQueryBuilder } from "../../../../clients/access-management/enduser/connections/index.js";
import { getOptions } from "../../../../helpers.js";
import { withRetries } from "../../../building-blocks/common/retry.js";
import { ResourceGetResourceList } from "../../../building-blocks/resource-registry/resource/index.js";
import { DelegationCheckReasonCode } from "../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup as commonSetup } from "./common.js";
import { getOwnerResourceClient } from "./resources.js";

const resourceListLabel = { step: "Read every resource in the registry" };
const delegationCheckLabel = { step: "Ask Access Management about each resource" };

// One request per resource, and the whole comparison is one iteration. tt02 has
// over 5,000 resources, which takes longer than k6's default ten minute limit;
// cut off there, the run ends before any of its checks and looks green. So the
// limit is raised, which can only be done on a scenario. VUs and iterations are
// left out: shared-iterations defaults to one VU and one iteration.
export const options = {
    ...getOptions([resourceListLabel, delegationCheckLabel]),
    scenarios: {
        default: {
            executor: "shared-iterations",
            maxDuration: "60m",
        },
    },
};

/**
 * How each resource came out, counted per outcome.
 */
const outcomes = new Counter("registry_vs_access_management");

/**
 * Reads the test data and the registry's full resource list.
 *
 * @returns {ReturnType<typeof commonSetup> & {resources: Array<{identifier: string, delegable: boolean, accessListMode: string}>}} The test data.
 */
export function setup() {
    const data = commonSetup();
    const resources = (ResourceGetResourceList(getOwnerResourceClient(), null, resourceListLabel) ?? [])
        .map((resource) => ({
            identifier: String(resource.identifier),
            delegable: resource.delegable === true,
            accessListMode: String(resource.accessListMode ?? "Disabled"),
        }));

    return { ...data, resources };
}

/**
 * What Access Management's delegation check says about one resource.
 *
 * @param {Array<*>} rights The rights in the delegation check response.
 * @param {string} reasonCode The reason to look for.
 * @returns {boolean|null} True if every right carries the reason, false if none
 * does, null if the rights disagree among themselves.
 */
function everyRightCarries(rights, reasonCode) {
    const carries = rights.map((right) => (right?.reasonCodes ?? []).includes(reasonCode));

    if (carries.every(Boolean)) {
        return true;
    }

    return carries.some(Boolean) ? null : false;
}

/**
 * Compares Access Management's view of every resource in the registry with the
 * registry's own (Altinn/altinn-auth#4859, #4860).
 *
 * The backfill in #4859 is meant to give every resource imported before the
 * new fields existed its Delegable and AccessListMode. The tests in this folder
 * only use resources created after the import learned those fields, so they
 * would not notice a resource the backfill missed. This asks the enduser
 * delegation check about every resource in the registry, as one daglig leder on
 * behalf of their organization, and reads the answer back as the two fields:
 *
 * - Delegable is false when every right is refused for ResourceNotDelegable.
 * - AccessListMode is Enabled when every right is refused for
 * AccessListValidationFail. That holds as long as the organization is on none
 * of the resource's access lists, which is the case for the test organizations
 * as far as anyone knows. A mismatch on a resource with lists is worth a look
 * before it is called a bug.
 *
 * Resources Access Management does not answer 200 for are counted and listed
 * separately, and fail the run: it never imported them. Resources the registry
 * has no policy for, or whose policy has no rights, cannot be compared and are
 * only counted.
 *
 * Before #4789 the delegation check reads both fields from the registry itself,
 * through a ten minute cache, so the two can only disagree for a resource that
 * changed in the last ten minutes, and what the run says is which resources
 * Access Management knows at all. After #4789 it reads its own copy, and this is
 * the comparison #4859 asks for.
 *
 * Not scheduled. It sends one request per resource in the registry and is meant
 * to be run by hand in each environment once the backfill has run.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = data.users[0];
    const { connections, tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    /** @type {{[outcome: string]: Array<string>}} */
    const byOutcome = {};
    const record = (/** @type {string} */ outcome, /** @type {string} */ identifier) => {
        (byOutcome[outcome] ??= []).push(identifier);
        outcomes.add(1, { outcome });
    };

    for (const resource of data.resources) {
        const res = withRetries(
            () => connections.GetResourceDelegationCheck(
                new GetResourceDelegationCheckQueryBuilder()
                    .withParty(user.orgUuid)
                    .withResource(resource.identifier)
                    .build(),
                delegationCheckLabel,
            ),
            "GetResourceDelegationCheck",
        );

        if (res.status !== 200) {
            // The delegation check needs the resource's policy, and answers
            // AM-00027 for a resource the registry has none for. That says
            // nothing about Access Management's copy, so it is only counted.
            // Seen for 21 of 675 resources in at22 on 2026-11-12.
            const hasPolicy = getOwnerResourceClient().ResourceGetPolicy(resource.identifier, resourceListLabel).status === 200;

            record(hasPolicy ? `not answered (${res.status})` : "no policy in the registry", resource.identifier);
            continue;
        }

        /** @type {Array<*>} */
        let rights = [];

        try {
            rights = JSON.parse(String(res.body))?.rights ?? [];
        } catch (error) {
            record("not answered (unreadable body)", resource.identifier);
            continue;
        }

        if (rights.length === 0) {
            record("no rights to compare", resource.identifier);
            continue;
        }

        const amNotDelegable = everyRightCarries(rights, DelegationCheckReasonCode.ResourceNotDelegable);
        const amAccessList = everyRightCarries(rights, DelegationCheckReasonCode.AccessListValidationFail);
        let agrees = true;

        if (amNotDelegable === null || amNotDelegable === resource.delegable) {
            record(`Delegable differs (registry ${resource.delegable})`, resource.identifier);
            agrees = false;
        }

        if (amAccessList === null || amAccessList !== (resource.accessListMode === "Enabled")) {
            record(`AccessListMode differs (registry ${resource.accessListMode})`, resource.identifier);
            agrees = false;
        }

        if (agrees) {
            record("agrees", resource.identifier);
        }
    }

    const count = (/** @type {(outcome: string) => boolean} */ match) => Object.entries(byOutcome)
        .filter(([outcome]) => match(outcome))
        .reduce((sum, [, identifiers]) => sum + identifiers.length, 0);

    // Only the outcomes that fail a check are worth a line: the rest are in the
    // registry_vs_access_management metric, counted per outcome.
    for (const [outcome, identifiers] of Object.entries(byOutcome)) {
        if (/^(not answered|Delegable differs|AccessListMode differs)/.test(outcome)) {
            console.error(`${outcome} in ${__ENV.ENVIRONMENT}: ${identifiers.join(", ")}`);
        }
    }

    check(byOutcome, {
        "The registry has resources to compare": () => data.resources.length > 0,
        "Access Management answers for every registry resource": () => count((o) => o.startsWith("not answered")) === 0,
        "Delegable agrees for every resource": () => count((o) => o.startsWith("Delegable differs")) === 0,
        "AccessListMode agrees for every resource": () => count((o) => o.startsWith("AccessListMode differs")) === 0,
    });
}
