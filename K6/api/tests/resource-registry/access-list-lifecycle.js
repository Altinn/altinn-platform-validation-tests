import { group } from "k6";

import { getStrictOptions, pickUnique } from "../../../helpers.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListDelete,
    AccessListGet,
    AccessListGetByOwner,
    AccessListGetMembers,
    AccessListRemoveMembers,
    AccessListReplaceMembers,
    AccessListsDeleteResourceConnection,
    AccessListsGetResourceConnections,
    AccessListsUpsertResourceConnection,
} from "../../building-blocks/resource-registry/access-lists/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import {
    deleteTestLists,
    expectingStatus,
    getAccessListClient,
    getConfiguration,
    loadBusinesses,
    newIdentifier,
    organizationUrn,
    partyUuidUrn,
    requireFamilyEnv,
} from "./commons.js";

const createLabel = { step: "Create and read an access list" };
const updateLabel = { step: "Update the description" };
const membersLabel = { step: "Add replace and remove members" };
const connectionsLabel = { step: "Connect and disconnect a resource" };
const deleteLabel = { step: "Delete the access list" };

export const options = getStrictOptions([
    createLabel,
    updateLabel,
    membersLabel,
    connectionsLabel,
    deleteLabel,
]);

const ACTION_FILTERS = ["read", "write"];

/**
 * Picks the businesses this run adds as members: two companies and one sole
 * proprietorship, so both organization forms go through the members endpoints.
 *
 * @returns {{companies: Array<import("./commons.js").Business>, soleProprietorship: import("./commons.js").Business}} The members.
 */
export function setup() {
    requireFamilyEnv();
    getConfiguration();

    return {
        companies: pickUnique(loadBusinesses("AS"), 2),
        soleProprietorship: pickUnique(loadBusinesses("ENK"), 1)[0],
    };
}

/**
 * Test: an access list goes through its whole life and every read along the
 * way returns what was written.
 *
 * Create, read, list by owner, update, add members, replace them, remove them,
 * connect a resource, list by resource, disconnect it, delete, and confirm the
 * list is gone. Every step reads back and checks content, not just status, so
 * a registry that accepts a write and stores something else fails here. The
 * final 404 is checked on the client directly, since the building blocks only
 * accept 200.
 *
 * @param {ReturnType<typeof setup>} data The members picked in setup.
 */
export default function (data) {
    const client = getAccessListClient();
    const { owner, resourceId } = getConfiguration();
    const identifier = newIdentifier();
    const written = {
        owner,
        identifier,
        name: `k6 lifecycle ${identifier}`,
        description: "Created by the resource-registry lifecycle test",
    };

    group("Create and read an access list", function () {
        const created = AccessListCreateOrUpdate(client, owner, identifier, {
            name: written.name,
            description: written.description,
        }, createLabel);

        AccessListDomainChecks.CheckAccessListInfo(created, written, "AccessListCreateOrUpdate");

        const read = AccessListGet(client, owner, identifier, createLabel);

        AccessListDomainChecks.CheckAccessListInfo(read, written, "AccessListGet");

        const byOwner = AccessListGetByOwner(client, owner, null, createLabel);

        AccessListDomainChecks.CheckContainsList(byOwner?.data, identifier, "AccessListGetByOwner");
    });

    group("Update the description", function () {
        // PATCH is not implemented in the registry (it answers 501 and its
        // remarks say to use PUT), so the update goes through the same upsert
        // that created the list.
        const updated = { ...written, description: "Updated by the resource-registry lifecycle test" };

        const upserted = AccessListCreateOrUpdate(client, owner, identifier, {
            name: updated.name,
            description: updated.description,
        }, updateLabel);

        AccessListDomainChecks.CheckAccessListInfo(upserted, updated, "AccessListCreateOrUpdate on an existing list");

        const read = AccessListGet(client, owner, identifier, updateLabel);

        AccessListDomainChecks.CheckAccessListInfo(read, updated, "AccessListGet after update");
    });

    group("Add replace and remove members", function () {
        const all = [...data.companies, data.soleProprietorship];
        const partyUrns = Object.fromEntries(all.map((business) => [business.orgNo, partyUuidUrn(business.partyUuid)]));

        const added = AccessListAddMembers(client, owner, identifier, {
            data: all.map((business) => organizationUrn(business.orgNo)),
        }, membersLabel);

        AccessListDomainChecks.CheckMembers(added, all.map((business) => business.orgNo), "AccessListAddMembers");

        const members = AccessListGetMembers(client, owner, identifier, null, membersLabel);

        AccessListDomainChecks.CheckMembers(members, all.map((business) => business.orgNo), "AccessListGetMembers");
        AccessListDomainChecks.CheckMembersResolveToParties(members, partyUrns, "AccessListGetMembers");

        const replaced = AccessListReplaceMembers(client, owner, identifier, {
            data: [organizationUrn(data.soleProprietorship.orgNo)],
        }, membersLabel);

        AccessListDomainChecks.CheckMembers(replaced, [data.soleProprietorship.orgNo], "AccessListReplaceMembers");

        const afterReplace = AccessListGetMembers(client, owner, identifier, null, membersLabel);

        AccessListDomainChecks.CheckMembers(afterReplace, [data.soleProprietorship.orgNo], "AccessListGetMembers after replace");

        const removed = AccessListRemoveMembers(client, owner, identifier, {
            data: [organizationUrn(data.soleProprietorship.orgNo)],
        }, membersLabel);

        AccessListDomainChecks.CheckMembers(removed, [], "AccessListRemoveMembers");

        const afterRemove = AccessListGetMembers(client, owner, identifier, null, membersLabel);

        AccessListDomainChecks.CheckMembers(afterRemove, [], "AccessListGetMembers after remove");
    });

    group("Connect and disconnect a resource", function () {
        const expected = [{ resourceIdentifier: resourceId, actionFilters: ACTION_FILTERS }];
        // `resource` does not filter the lists; it filters the connections the
        // listing includes on each list down to that resource.
        const includeConnections = { include: ["resource-actions"], resource: resourceId };
        const connectionsOf = (/** @type {import("../../../clients/resource-registry/types.js").AccessListInfoDtoPaginated|null} */ listing) =>
            listing?.data.find((list) => list.identifier === identifier)?.resourceConnections;

        AccessListsUpsertResourceConnection(client, owner, identifier, resourceId, {
            actionFilters: ACTION_FILTERS,
        }, connectionsLabel);

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, connectionsLabel);

        AccessListDomainChecks.CheckResourceConnections(connections?.data, expected, "AccessListGetResourceConnections");

        const listing = AccessListGetByOwner(client, owner, includeConnections, connectionsLabel);

        AccessListDomainChecks.CheckContainsList(listing?.data, identifier, "AccessListGetByOwner with resources included");
        AccessListDomainChecks.CheckResourceConnections(connectionsOf(listing), expected, "AccessListGetByOwner with resources included");

        AccessListsDeleteResourceConnection(client, owner, identifier, resourceId, connectionsLabel);

        const afterDelete = AccessListsGetResourceConnections(client, owner, identifier, null, connectionsLabel);

        AccessListDomainChecks.CheckResourceConnections(afterDelete?.data, [], "AccessListGetResourceConnections after delete");

        const listingAfter = AccessListGetByOwner(client, owner, includeConnections, connectionsLabel);

        AccessListDomainChecks.CheckResourceConnections(connectionsOf(listingAfter) ?? [], [], "AccessListGetByOwner with resources included after delete");
    });

    group("Delete the access list", function () {
        AccessListDelete(client, owner, identifier, deleteLabel);

        // The building block only accepts 200, so the 404 is checked on the client,
        // and marked as expected so it does not count as a failed request.
        const res = expectingStatus(404, () => client.AccessListGet(owner, identifier, null, {}, deleteLabel));

        AccessListDomainChecks.CheckStatus(res, 404, "AccessListGet after delete");

        const byOwner = AccessListGetByOwner(client, owner, null, deleteLabel);

        AccessListDomainChecks.CheckDoesNotContainList(byOwner?.data, identifier, "AccessListGetByOwner after delete");
    });
}

/**
 * Deletes whatever lists the run left behind, so a failure halfway does not
 * pile up lists in the environment.
 */
export function teardown() {
    const deleted = deleteTestLists();

    if (deleted > 0) {
        console.warn(`teardown - deleted ${deleted} access list(s) the test left behind`);
    }
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
