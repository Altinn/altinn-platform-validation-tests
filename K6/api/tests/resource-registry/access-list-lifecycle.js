import { fail, group } from "k6";

import {
    AccessListMembersBuilder,
    AccessListResourceConnectionBuilder,
    CreateAccessListBuilder,
    PartyUrn,
    ResourceUrn,
} from "../../../clients/resource-registry/index.js";
import { getItemFromList, getOptions, pickUnique, requireEnv } from "../../../helpers.js";
import {
    AccessListAddMembers,
    AccessListCreateOrUpdate,
    AccessListDelete,
    AccessListGet,
    AccessListGetByMember,
    AccessListGetByOwner,
    AccessListGetMembers,
    AccessListRemoveMembers,
    AccessListReplaceMembers,
    AccessListsDeleteResourceConnection,
    AccessListsGetResourceConnections,
    AccessListsUpsertResourceConnection,
} from "../../building-blocks/resource-registry/access-lists/index.js";
import { AccessListMembershipsGetMemberships } from "../../building-blocks/resource-registry/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import {
    deleteTestListsOf,
    getAccessListClient,
    getAccessListMembershipsClient,
    getAccessListPlatformClient,
    getOrganizations,
    getResources,
    newIdentifier,
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

export const options = getOptions([
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

/**
 * An owner the test's token is not issued for, so reading its lists has to be
 * refused. digdir is a real service owner in every environment.
 */
const OTHER_OWNER = "digdir";

/**
 * Reads the test data once: the resources the iterations pick from, and the
 * organizations this run adds as members, two companies and one sole
 * proprietorship, so both organization forms go through the members endpoints.
 *
 * @returns {{resources: Array<import("./commons.js").Resource>, companies: Array<import("./commons.js").Organization>, soleProprietorship: import("./commons.js").Organization}} The test data.
 */
export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT"]);

    return {
        resources: getResources(),
        companies: pickUnique(getOrganizations("AS"), 2),
        soleProprietorship: pickUnique(getOrganizations("ENK"), 1)[0],
    };
}

/**
 * The ETag a versioned call came back with, or the end of the test when
 * there is none, since every conditional call builds on it.
 *
 * @param {{etag: string|null}} result What the building block returned.
 * @param {string} operation Name of the operation, for the message.
 * @returns {string} The ETag.
 */
function requireEtag(result, operation) {
    AccessListDomainChecks.CheckHasEtag(result.etag, operation);

    return result.etag ?? fail(`cannot continue: ${operation} carried no ETag, so the conditional calls cannot be made`);
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
 * stays in the event log for good. One list per run keeps that to the nine
 * events a lifecycle needs, and the steps that expect a refusal (412, 403) or
 * repeat an identical write add no events at all.
 *
 * The calls that expect something other than 200 say so through the building
 * blocks' `options`, which mark that status as expected so it does not count
 * as a failed request, and the versioned building blocks hand back the ETag
 * the next conditional call needs.
 *
 * The steps the rest of the run builds on (the create, the members, the
 * connection, and every ETag the conditional calls need) end the iteration
 * with fail() when they do not hold, so one root cause shows up as one failed
 * check and a "cannot continue" line rather than a dozen failures downstream.
 * Teardown deletes the list either way.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 */
export default function (data) {
    // One resource per iteration, and the list is owned by whoever owns it.
    const { owner, ownerOrgNo, resourceId, actions } = getItemFromList(data.resources);
    const client = getAccessListClient(owner, ownerOrgNo);
    const identifier = newIdentifier();
    const written = {
        owner,
        identifier,
        name: `k6 lifecycle ${identifier}`,
        description: "Created by the resource-registry lifecycle test",
    };
    const updated = { ...written, description: "Updated by the resource-registry lifecycle test" };
    const all = [...data.companies, data.soleProprietorship];
    const memberParty = PartyUrn.partyUuid(data.soleProprietorship.partyUuid);
    const resource = ResourceUrn.resourceId(resourceId);
    /** @type {string} */
    let etag = "";
    /** @type {string} */
    let etagBeforeConnection = "";
    /** @type {string} */
    let etagAfterConnection = "";

    group("Create and read an access list", function () {
        const created = AccessListCreateOrUpdate(client, owner, identifier, new CreateAccessListBuilder()
            .withName(written.name)
            .withDescription(written.description)
            .build(), null, createLabel);

        if (!AccessListDomainChecks.CheckAccessListInfo(created.value, written, "AccessListCreateOrUpdate")) {
            fail("cannot continue: the access list was not created as written, and every later step builds on it");
        }

        const read = AccessListGet(client, owner, identifier, null, createLabel);

        AccessListDomainChecks.CheckAccessListInfo(read.value, written, "AccessListGet");
        etag = requireEtag(read, "AccessListGet");

        const byOwner = AccessListGetByOwner(client, owner, null, null, createLabel);

        AccessListDomainChecks.CheckContainsList(byOwner?.data, identifier, "AccessListGetByOwner");
    });

    group("Update and create-only upsert", function () {
        // PATCH is not implemented in the registry (it answers 501 and its
        // remarks say to use PUT), so the update goes through the same upsert
        // that created the list.
        const body = new CreateAccessListBuilder().withName(updated.name).withDescription(updated.description).build();

        // If-None-Match: * asks for a create and nothing else, so it has to be
        // refused now that the list exists, and the description stays as it was.
        AccessListCreateOrUpdate(client, owner, identifier, body, { headers: { "If-None-Match": "*" }, expectedStatus: 412 }, updateLabel);

        // If-Match: * asks for an update of an existing list, which this is, so
        // the update itself goes through under that header.
        const updateOnly = AccessListCreateOrUpdate(client, owner, identifier, body, { headers: { "If-Match": "*" } }, updateLabel);

        AccessListDomainChecks.CheckAccessListInfo(updateOnly.value, updated, "AccessListCreateOrUpdate with If-Match: *");
        AccessListDomainChecks.CheckEtagChanged(etag, updateOnly.etag, "AccessListCreateOrUpdate with If-Match: *");
        etag = requireEtag(updateOnly, "AccessListCreateOrUpdate with If-Match: *");

        const read = AccessListGet(client, owner, identifier, null, updateLabel);

        AccessListDomainChecks.CheckAccessListInfo(read.value, updated, "AccessListGet after update");
    });

    group("Conditional reads with If-None-Match", function () {
        AccessListGet(client, owner, identifier, { headers: { "If-None-Match": etag }, expectedStatus: 304 }, readsLabel);

        // The members share the list's version, so the same ETag holds there.
        AccessListGetMembers(client, owner, identifier, null, { headers: { "If-None-Match": etag }, expectedStatus: 304 }, readsLabel);
    });

    group("Add members", function () {
        const partyUrns = Object.fromEntries(all.map((organization) => [organization.orgNo, PartyUrn.partyUuid(organization.partyUuid)]));

        const added = AccessListAddMembers(client, owner, identifier, new AccessListMembersBuilder()
            .withOrganizations(all.map((organization) => organization.orgNo))
            .build(), membersLabel);

        if (!AccessListDomainChecks.CheckMembers(added, all.map((organization) => organization.orgNo), "AccessListAddMembers")) {
            fail("cannot continue: the members were not added, so there is nothing to look up, replace or remove");
        }

        const members = AccessListGetMembers(client, owner, identifier, null, null, membersLabel);

        AccessListDomainChecks.CheckMembers(members.value, all.map((organization) => organization.orgNo), "AccessListGetMembers");
        AccessListDomainChecks.CheckMembersResolveToParties(members.value, partyUrns, "AccessListGetMembers");

        // Adding members moved the version on; the members read carries the
        // current ETag for the conditional writes that follow.
        etagBeforeConnection = requireEtag(members, "AccessListGetMembers");
    });

    group("Connect a resource with If-Match", function () {
        const connection = new AccessListResourceConnectionBuilder().withActionFilters(actions).build();
        const expected = [{ resourceIdentifier: resourceId, actionFilters: actions }];

        // The connection is written under If-Match on purpose: this is the
        // conditional write of the registry's optimistic concurrency, and the
        // ETag from the read above is the current version, so it has to go
        // through and move the version on. The stale write further down proves
        // the other half.
        const underCurrentEtag = AccessListsUpsertResourceConnection(client, owner, identifier, resourceId, connection, { headers: { "If-Match": etagBeforeConnection } }, connectionLabel);

        if (underCurrentEtag.value === null) {
            fail("cannot continue: the resource connection was not made, so the lookups and the conditional writes have nothing to work on");
        }

        etagAfterConnection = requireEtag(underCurrentEtag, "AccessListsUpsertResourceConnection");
        AccessListDomainChecks.CheckEtagChanged(etagBeforeConnection, etagAfterConnection, "AccessListsUpsertResourceConnection");

        // The same connection written again changes nothing, so the registry
        // must not record a new version for it.
        const identical = AccessListsUpsertResourceConnection(client, owner, identifier, resourceId, connection, null, connectionLabel);

        AccessListDomainChecks.CheckEtagUnchanged(etagAfterConnection, identical.etag, "AccessListsUpsertResourceConnection repeated unchanged");

        // A write under the ETag from before the connection is stale and has to
        // be refused without touching the connection.
        AccessListsUpsertResourceConnection(
            client,
            owner,
            identifier,
            resourceId,
            new AccessListResourceConnectionBuilder().withActionFilters(actions.slice(0, 1)).build(),
            { headers: { "If-Match": etagBeforeConnection }, expectedStatus: 412 },
            connectionLabel,
        );

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, connectionLabel);

        AccessListDomainChecks.CheckResourceConnections(connections?.data, expected, "AccessListsGetResourceConnections");

        // `resource` does not filter the lists; it narrows the connections the
        // listing includes on each list to that resource, and the action
        // filters only come with resource-actions.
        const listing = AccessListGetByOwner(client, owner, { include: ["resource-actions"], resource: resourceId }, null, connectionLabel);

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
            { party: [memberParty], resource: [resource] },
            lookupsLabel,
        );

        AccessListDomainChecks.CheckMembership(memberships, {
            party: memberParty,
            resource,
            actionFilters: actions,
        }, "AccessListMembershipsGetMemberships");

        const lists = AccessListGetByMember(getAccessListPlatformClient(), memberParty, lookupsLabel);

        AccessListDomainChecks.CheckContainsList(lists, identifier, "AccessListGetByMember");
    });

    group("Replace and remove members", function () {
        const soleProprietorshipOnly = new AccessListMembersBuilder().withOrganization(data.soleProprietorship.orgNo).build();

        const replaced = AccessListReplaceMembers(client, owner, identifier, soleProprietorshipOnly, replaceLabel);

        AccessListDomainChecks.CheckMembers(replaced, [data.soleProprietorship.orgNo], "AccessListReplaceMembers");

        const afterReplace = AccessListGetMembers(client, owner, identifier, null, null, replaceLabel);

        AccessListDomainChecks.CheckMembers(afterReplace.value, [data.soleProprietorship.orgNo], "AccessListGetMembers after replace");

        const removed = AccessListRemoveMembers(client, owner, identifier, soleProprietorshipOnly, replaceLabel);

        AccessListDomainChecks.CheckMembers(removed, [], "AccessListRemoveMembers");

        const afterRemove = AccessListGetMembers(client, owner, identifier, null, null, replaceLabel);

        AccessListDomainChecks.CheckMembers(afterRemove.value, [], "AccessListGetMembers after remove");
    });

    group("Disconnect the resource", function () {
        AccessListsDeleteResourceConnection(client, owner, identifier, resourceId, disconnectLabel);

        const connections = AccessListsGetResourceConnections(client, owner, identifier, null, disconnectLabel);

        AccessListDomainChecks.CheckResourceConnections(connections?.data, [], "AccessListsGetResourceConnections after delete");

        const listing = AccessListGetByOwner(client, owner, { include: ["resource-actions"], resource: resourceId }, null, disconnectLabel);

        AccessListDomainChecks.CheckResourceConnections(
            listing?.data.find((list) => list.identifier === identifier)?.resourceConnections ?? [],
            [],
            "AccessListGetByOwner with resource-actions included after delete",
        );
    });

    group("Read the lists of another owner", function () {
        // The token is issued for `owner`, and the registry checks it against
        // the owner in the path, so another owner's lists are off limits.
        AccessListGetByOwner(client, OTHER_OWNER, null, { expectedStatus: 403 }, ownerLabel);
    });

    group("Conditional delete", function () {
        // Everything since the connection moved the version on, so that ETag is
        // stale by now.
        AccessListDelete(client, owner, identifier, { headers: { "If-Match": etagAfterConnection }, expectedStatus: 412 }, deleteLabel);

        const stillThere = AccessListGet(client, owner, identifier, null, deleteLabel);

        AccessListDomainChecks.CheckAccessListInfo(stillThere.value, updated, "AccessListGet after rejected delete");

        AccessListDelete(client, owner, identifier, { headers: { "If-Match": requireEtag(stillThere, "AccessListGet after rejected delete") } }, deleteLabel);

        AccessListGet(client, owner, identifier, { expectedStatus: 404 }, deleteLabel);

        const byOwner = AccessListGetByOwner(client, owner, null, null, deleteLabel);

        AccessListDomainChecks.CheckDoesNotContainList(byOwner?.data, identifier, "AccessListGetByOwner after delete");
    });
}

/**
 * Deletes whatever lists the run left behind, for every owner in the test
 * data, so a failure halfway does not pile up lists in the environment.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 */
export function teardown(data) {
    const deleted = deleteTestListsOf(data.resources);

    if (deleted > 0) {
        console.warn(`teardown - deleted ${deleted} access list(s) the test left behind`);
    }
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
