import { fail, group } from "k6";

import { getStrictOptions, pickUnique } from "../../../helpers.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListGet,
    AccessListGetByMember,
    AccessListGetByOwner,
    AccessListGetMembers,
    AccessListRemoveMembers,
    AccessListReplaceMembers,
    AccessListsDeleteResourceConnection,
    AccessListsGetResourceConnections,
} from "../../building-blocks/resource-registry/access-lists/index.js";
import { AccessListMembershipsGetMemberships } from "../../building-blocks/resource-registry/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import {
    deleteTestLists,
    etagOf,
    expectingStatus,
    getAccessListClient,
    getAccessListMembershipsClient,
    getAccessListPlatformClient,
    getConfiguration,
    loadOrganizations,
    newIdentifier,
    organizationUrn,
    partyUuidUrn,
    requireFamilyEnv,
    resourceUrn,
    versionOf,
} from "./commons.js";

const createLabel = { step: "Create and read an access list" };
const updateLabel = { step: "Update and create-only upsert" };
const readsLabel = { step: "Conditional reads with If-None-Match" };
const membersLabel = { step: "Add members" };
const connectionLabel = { step: "Connect a resource with If-Match" };
const lookupsLabel = { step: "Look up memberships and lists by member" };
const replaceLabel = { step: "Replace and remove members" };
const disconnectLabel = { step: "Disconnect the resource" };
const ownerLabel = { step: "Read the lists of another owner" };
const deleteLabel = { step: "Conditional delete" };

export const options = getStrictOptions([
    createLabel,
    updateLabel,
    readsLabel,
    membersLabel,
    connectionLabel,
    lookupsLabel,
    replaceLabel,
    disconnectLabel,
    ownerLabel,
    deleteLabel,
]);

const ACTION_FILTERS = ["read", "write"];

/**
 * An owner the test's token is not issued for, so reading its lists has to be
 * refused. digdir is a real service owner in every environment.
 */
const OTHER_OWNER = "digdir";

/**
 * Picks the organizations this run adds as members: two companies and one sole
 * proprietorship, so both organization forms go through the members endpoints.
 *
 * @returns {{companies: Array<import("./commons.js").Organization>, soleProprietorship: import("./commons.js").Organization}} The members.
 */
export function setup() {
    requireFamilyEnv();
    getConfiguration();

    return {
        companies: pickUnique(loadOrganizations("AS"), 2),
        soleProprietorship: pickUnique(loadOrganizations("ENK"), 1)[0],
    };
}

/**
 * The ETag of a response, or the end of the test when there is none, since
 * every conditional call builds on it.
 *
 * @param {import("k6/http").RefinedResponse<any>} res The response.
 * @param {string} operation Name of the operation, for the message.
 * @returns {string} The ETag.
 */
function requireEtag(res, operation) {
    const etag = etagOf(res);

    AccessListDomainChecks.CheckHasEtag(etag, operation);

    return etag ?? fail(`${operation} carried no ETag, so the conditional calls cannot be made`);
}

/**
 * Test: one access list goes through its whole life, and every read along the
 * way returns what was written.
 *
 * Create, read, update, conditional reads, members, a resource connection
 * written under If-Match, the two platform-component lookups, replacing and
 * removing the members, disconnecting, a read as the wrong owner, and a
 * conditional delete. Every step checks content, not just status, so a
 * registry that accepts a write and stores something else fails here.
 *
 * Everything happens on one list on purpose. Access lists are event-sourced in
 * the registry: deleting a list removes its state, but every write it ever saw
 * stays in the event log for good. One list per run keeps that to the eight or
 * nine events a lifecycle needs, and the steps that expect a refusal (412, 403)
 * or repeat an identical write add no events at all.
 *
 * The calls that expect something other than 200 go straight to the client,
 * since the building blocks only accept 200, with the expected status marked as
 * expected so it does not count as a failed request.
 *
 * The steps the rest of the run builds on (the create, the members, the
 * connection, and every ETag the conditional calls need) end the iteration
 * with fail() when they do not hold, so one root cause shows up as one failed
 * check and a "cannot continue" line rather than a dozen failures downstream.
 * Teardown deletes the list either way.
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
    const all = [...data.companies, data.soleProprietorship];
    const memberParty = partyUuidUrn(data.soleProprietorship.partyUuid);
    /** @type {string} */
    let etag = "";
    /** @type {string} */
    let etagBeforeConnection = "";
    /** @type {string} */
    let etagAfterConnection = "";
    /** @type {number|null} */
    let firstVersion = null;

    group("Create and read an access list", function () {
        const created = AccessListCreateOrUpdate(client, owner, identifier, {
            name: written.name,
            description: written.description,
        }, createLabel);

        if (!AccessListDomainChecks.CheckAccessListInfo(created, written, "AccessListCreateOrUpdate")) {
            fail("cannot continue: the access list was not created as written, and every later step builds on it");
        }

        const read = client.AccessListGet(owner, identifier, null, {}, createLabel);

        AccessListDomainChecks.CheckStatus(read, 200, "AccessListGet");
        AccessListDomainChecks.CheckAccessListInfo(JSON.parse(String(read.body)), written, "AccessListGet");
        etag = requireEtag(read, "AccessListGet");
        firstVersion = versionOf(etag);

        const byOwner = AccessListGetByOwner(client, owner, null, createLabel);

        AccessListDomainChecks.CheckContainsList(byOwner?.data, identifier, "AccessListGetByOwner");
    });

    group("Update and create-only upsert", function () {
        // PATCH is not implemented in the registry (it answers 501 and its
        // remarks say to use PUT), so the update goes through the same upsert
        // that created the list.
        const updated = { ...written, description: "Updated by the resource-registry lifecycle test" };
        const body = { name: updated.name, description: updated.description };

        // If-None-Match: * asks for a create and nothing else, so it has to be
        // refused now that the list exists, and the description stays as it was.
        const createOnly = expectingStatus(412, () => client.AccessListUpsert(owner, identifier, body, { "If-None-Match": "*" }, updateLabel));

        AccessListDomainChecks.CheckStatus(createOnly, 412, "AccessListUpsert with If-None-Match: *");

        // If-Match: * asks for an update of an existing list, which this is, so
        // the update itself goes through under that header.
        const updateOnly = client.AccessListUpsert(owner, identifier, body, { "If-Match": "*" }, updateLabel);

        AccessListDomainChecks.CheckStatus(updateOnly, 200, "AccessListUpsert with If-Match: *");
        AccessListDomainChecks.CheckAccessListInfo(JSON.parse(String(updateOnly.body)), updated, "AccessListUpsert with If-Match: *");
        AccessListDomainChecks.CheckEtagChanged(etag, etagOf(updateOnly), "AccessListUpsert with If-Match: *");
        etag = requireEtag(updateOnly, "AccessListUpsert with If-Match: *");

        const read = AccessListGet(client, owner, identifier, updateLabel);

        AccessListDomainChecks.CheckAccessListInfo(read, updated, "AccessListGet after update");
    });

    group("Conditional reads with If-None-Match", function () {
        const unchanged = client.AccessListGet(owner, identifier, null, { "If-None-Match": etag }, readsLabel);

        AccessListDomainChecks.CheckStatus(unchanged, 304, "AccessListGet with matching If-None-Match");

        // The members share the list's version, so the same ETag holds there.
        const members = client.AccessListGetMembers(owner, identifier, null, { "If-None-Match": etag }, readsLabel);

        AccessListDomainChecks.CheckStatus(members, 304, "AccessListGetMembers with matching If-None-Match");
    });

    group("Add members", function () {
        const partyUrns = Object.fromEntries(all.map((organization) => [organization.orgNo, partyUuidUrn(organization.partyUuid)]));

        const added = AccessListAddMembers(client, owner, identifier, {
            data: all.map((organization) => organizationUrn(organization.orgNo)),
        }, membersLabel);

        if (!AccessListDomainChecks.CheckMembers(added, all.map((organization) => organization.orgNo), "AccessListAddMembers")) {
            fail("cannot continue: the members were not added, so there is nothing to look up, replace or remove");
        }

        const members = AccessListGetMembers(client, owner, identifier, null, membersLabel);

        AccessListDomainChecks.CheckMembers(members, all.map((organization) => organization.orgNo), "AccessListGetMembers");
        AccessListDomainChecks.CheckMembersResolveToParties(members, partyUrns, "AccessListGetMembers");

        // Adding members moved the version on; pick up the current ETag for the
        // conditional writes that follow.
        const read = client.AccessListGet(owner, identifier, null, {}, membersLabel);

        AccessListDomainChecks.CheckStatus(read, 200, "AccessListGet after adding members");
        etagBeforeConnection = requireEtag(read, "AccessListGet after adding members");
    });

    group("Connect a resource with If-Match", function () {
        const connection = { actionFilters: ACTION_FILTERS };
        const expected = [{ resourceIdentifier: resourceId, actionFilters: ACTION_FILTERS }];

        const current = client.AccessListUpsertResourceConnection(owner, identifier, resourceId, connection, { "If-Match": etagBeforeConnection }, connectionLabel);

        if (!AccessListDomainChecks.CheckStatus(current, 200, "AccessListUpsertResourceConnection with current If-Match")) {
            fail("cannot continue: the resource connection was not made, so the lookups and the conditional writes have nothing to work on");
        }

        etagAfterConnection = requireEtag(current, "AccessListUpsertResourceConnection");
        AccessListDomainChecks.CheckEtagChanged(etagBeforeConnection, etagAfterConnection, "AccessListUpsertResourceConnection");

        // The same connection written again changes nothing, so the registry
        // must not record a new version for it.
        const identical = client.AccessListUpsertResourceConnection(owner, identifier, resourceId, connection, {}, connectionLabel);

        AccessListDomainChecks.CheckStatus(identical, 200, "AccessListUpsertResourceConnection repeated unchanged");
        AccessListDomainChecks.CheckEtagUnchanged(etagAfterConnection, etagOf(identical), "AccessListUpsertResourceConnection repeated unchanged");

        // A write under the ETag from before the connection is stale and has to
        // be refused without touching the connection.
        const stale = expectingStatus(412, () => client.AccessListUpsertResourceConnection(
            owner,
            identifier,
            resourceId,
            { actionFilters: ["read"] },
            { "If-Match": etagBeforeConnection },
            connectionLabel,
        ));

        AccessListDomainChecks.CheckStatus(stale, 412, "AccessListUpsertResourceConnection with stale If-Match");

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, connectionLabel);

        AccessListDomainChecks.CheckResourceConnections(connections?.data, expected, "AccessListGetResourceConnections");

        // `resource` does not filter the lists; it narrows the connections the
        // listing includes on each list to that resource, and the action
        // filters only come with resource-actions.
        const listing = AccessListGetByOwner(client, owner, { include: ["resource-actions"], resource: resourceId }, connectionLabel);

        AccessListDomainChecks.CheckContainsList(listing?.data, identifier, "AccessListGetByOwner with resource-actions included");
        AccessListDomainChecks.CheckResourceConnections(
            listing?.data.find((list) => list.identifier === identifier)?.resourceConnections,
            expected,
            "AccessListGetByOwner with resource-actions included",
        );
    });

    group("Look up memberships and lists by member", function () {
        // Both lookups are reserved for platform components and take the
        // platform access token; both filters on the memberships query are URNs.
        const memberships = AccessListMembershipsGetMemberships(
            getAccessListMembershipsClient(),
            { party: [memberParty], resource: [resourceUrn(resourceId)] },
            lookupsLabel,
        );

        AccessListDomainChecks.CheckMembership(memberships, {
            party: memberParty,
            resource: resourceUrn(resourceId),
            actionFilters: ACTION_FILTERS,
        }, "AccessListMembershipsGetMemberships");

        const lists = AccessListGetByMember(getAccessListPlatformClient(), memberParty, lookupsLabel);

        AccessListDomainChecks.CheckContainsList(lists, identifier, "AccessListGetByMember");
    });

    group("Replace and remove members", function () {
        const replaced = AccessListReplaceMembers(client, owner, identifier, {
            data: [organizationUrn(data.soleProprietorship.orgNo)],
        }, replaceLabel);

        AccessListDomainChecks.CheckMembers(replaced, [data.soleProprietorship.orgNo], "AccessListReplaceMembers");

        const afterReplace = AccessListGetMembers(client, owner, identifier, null, replaceLabel);

        AccessListDomainChecks.CheckMembers(afterReplace, [data.soleProprietorship.orgNo], "AccessListGetMembers after replace");

        const removed = AccessListRemoveMembers(client, owner, identifier, {
            data: [organizationUrn(data.soleProprietorship.orgNo)],
        }, replaceLabel);

        AccessListDomainChecks.CheckMembers(removed, [], "AccessListRemoveMembers");

        const afterRemove = AccessListGetMembers(client, owner, identifier, null, replaceLabel);

        AccessListDomainChecks.CheckMembers(afterRemove, [], "AccessListGetMembers after remove");
    });

    group("Disconnect the resource", function () {
        AccessListsDeleteResourceConnection(client, owner, identifier, resourceId, disconnectLabel);

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, disconnectLabel);

        AccessListDomainChecks.CheckResourceConnections(connections?.data, [], "AccessListGetResourceConnections after delete");

        const listing = AccessListGetByOwner(client, owner, { include: ["resource-actions"], resource: resourceId }, disconnectLabel);

        AccessListDomainChecks.CheckResourceConnections(
            listing?.data.find((list) => list.identifier === identifier)?.resourceConnections ?? [],
            [],
            "AccessListGetByOwner with resource-actions included after delete",
        );
    });

    group("Read the lists of another owner", function () {
        // The token is issued for `owner`, and the registry checks it against
        // the owner in the path, so another owner's lists are off limits.
        const forbidden = expectingStatus(403, () => client.AccessListGetByOwner(OTHER_OWNER, null, ownerLabel));

        AccessListDomainChecks.CheckStatus(forbidden, 403, `AccessListGetByOwner as ${owner} for ${OTHER_OWNER}`);
    });

    group("Conditional delete", function () {
        // Everything since the connection moved the version on, so that ETag is
        // stale by now.
        const stale = expectingStatus(412, () => client.AccessListDelete(owner, identifier, { "If-Match": etagAfterConnection }, deleteLabel));

        AccessListDomainChecks.CheckStatus(stale, 412, "AccessListDelete with stale If-Match");

        const stillThere = client.AccessListGet(owner, identifier, null, {}, deleteLabel);

        AccessListDomainChecks.CheckStatus(stillThere, 200, "AccessListGet after rejected delete");

        const deleted = client.AccessListDelete(owner, identifier, { "If-Match": requireEtag(stillThere, "AccessListGet after rejected delete") }, deleteLabel);

        AccessListDomainChecks.CheckStatus(deleted, 200, "AccessListDelete with current If-Match");

        const gone = expectingStatus(404, () => client.AccessListGet(owner, identifier, null, {}, deleteLabel));

        AccessListDomainChecks.CheckStatus(gone, 404, "AccessListGet after delete");

        const byOwner = AccessListGetByOwner(client, owner, null, deleteLabel);

        AccessListDomainChecks.CheckDoesNotContainList(byOwner?.data, identifier, "AccessListGetByOwner after delete");

        // What this run cost the event log: the delete is the last event, one
        // past the version the deleted list reported.
        const lastVersion = versionOf(etagOf(deleted));

        if (firstVersion !== null && lastVersion !== null) {
            console.log(`access-list-lifecycle - ${identifier} went from version ${firstVersion} to ${lastVersion}: ${lastVersion - firstVersion + 1} events in the registry's log`);
        }
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
