import { group } from "k6";

import { getStrictOptions, pickUnique } from "../../../helpers.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListDelete,
    AccessListsUpsertResourceConnection,
} from "../../building-blocks/resource-registry/access-lists/index.js";
import {
    AccessListGetByMember,
    AccessListMembershipsGetMemberships,
} from "../../building-blocks/resource-registry/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import {
    deleteTestLists,
    getAccessListClient,
    getAccessListMembershipsClient,
    getConfiguration,
    loadBusinesses,
    newIdentifier,
    organizationUrn,
    partyUuidUrn,
    requireFamilyEnv,
    resourceUrn,
} from "./commons.js";

const membershipsLabel = { step: "Look up memberships for a party and a resource" };
const byMemberLabel = { step: "Look up the lists a party is a member of" };

export const options = getStrictOptions([membershipsLabel, byMemberLabel]);

const ACTION_FILTERS = ["read"];

/**
 * Creates the list the lookups read: one sole proprietorship as member,
 * connected to the configured resource. Done in setup, since the lookups
 * themselves write nothing.
 *
 * @returns {{identifier: string, member: import("./commons.js").Business}} The list and its member.
 */
export function setup() {
    requireFamilyEnv();

    const client = getAccessListClient();
    const { owner, resourceId } = getConfiguration();
    const identifier = newIdentifier();
    const member = pickUnique(loadBusinesses("ENK"), 1)[0];

    AccessListCreateOrUpdate(client, owner, identifier, {
        name: `k6 memberships ${identifier}`,
        description: "Created by the resource-registry memberships test",
    });
    AccessListAddMembers(client, owner, identifier, { data: [organizationUrn(member.orgNo)] });
    AccessListsUpsertResourceConnection(client, owner, identifier, resourceId, { actionFilters: ACTION_FILTERS });

    return { identifier, member };
}

/**
 * Test: the platform-component lookups see a membership the moment it is
 * written.
 *
 * The memberships query is what the PDP asks when a resource has access lists
 * enabled, so it reports the party, the resource and the action filters of
 * the connection. get-by-member is the reverse lookup: every list the party
 * sits on. Both take a platform access token, which is why they have their
 * own client. Both listings also hold whatever else the party is a member of
 * in the environment, so the checks look for our entry rather than counting.
 *
 * @param {ReturnType<typeof setup>} data The list created in setup.
 */
export default function (data) {
    const client = getAccessListMembershipsClient();
    const { resourceId } = getConfiguration();
    const party = partyUuidUrn(data.member.partyUuid);

    group("Look up memberships for a party and a resource", function () {
        // Both filters are URNs; a bare resource identifier is a 400.
        const memberships = AccessListMembershipsGetMemberships(client, { party: [party], resource: [resourceUrn(resourceId)] }, membershipsLabel);

        AccessListDomainChecks.CheckMembership(memberships, {
            party,
            resource: resourceUrn(resourceId),
            actionFilters: ACTION_FILTERS,
        }, "AccessListMembershipsGetMemberships");
    });

    group("Look up the lists a party is a member of", function () {
        const lists = AccessListGetByMember(client, party, byMemberLabel);

        AccessListDomainChecks.CheckContainsList(lists, data.identifier, "AccessListGetByMember");
    });
}

/**
 * Deletes the list setup created, and whatever else a failed run left behind.
 *
 * @param {ReturnType<typeof setup>} data The list created in setup.
 */
export function teardown(data) {
    const { owner } = getConfiguration();

    AccessListDelete(getAccessListClient(), owner, data.identifier);

    const deleted = deleteTestLists();

    if (deleted > 0) {
        console.warn(`teardown - deleted ${deleted} access list(s) the test left behind`);
    }
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
