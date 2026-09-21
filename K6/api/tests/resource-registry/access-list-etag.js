import { fail, group } from "k6";

import { getStrictOptions } from "../../../helpers.js";
import { AccessListCreateOrUpdate } from "../../building-blocks/resource-registry/access-lists/index.js";
import { AccessListDomainChecks } from "../../domain-checks/resource-registry/access-list.js";
import {
    deleteTestLists,
    etagOf,
    expectingStatus,
    getAccessListClient,
    getConfiguration,
    newIdentifier,
    requireFamilyEnv,
} from "./commons.js";

const readLabel = { step: "Conditional read with If-None-Match" };
const writeLabel = { step: "Conditional write with If-Match" };
const deleteLabel = { step: "Conditional delete with If-Match" };

export const options = getStrictOptions([readLabel, writeLabel, deleteLabel]);

export function setup() {
    requireFamilyEnv();
    getConfiguration();
}

/**
 * The ETag of a response, or the end of the test when there is none, since
 * every later step builds on it.
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
 * Test: the registry versions an access list and honours the conditional
 * headers built on that version.
 *
 * Every read answers with a weak ETag for the list's version. A read with
 * If-None-Match set to it gets a 304. A write moves the version on, so the
 * ETag from before the write is stale: the same write with that stale
 * If-Match gets a 412 and changes nothing, while the current one goes
 * through. A delete follows the same rules. The registry only accepts weak
 * ETags in If-Match, so the stale value is a real earlier ETag rather than a
 * made-up one, which it would reject with a 400 instead. The members read
 * shares the list's version, so it is checked too. The building blocks only
 * accept 200, so every conditional call goes straight to the client, with the
 * expected error status marked as expected so it does not count as a failed
 * request.
 */
export default function () {
    const client = getAccessListClient();
    const { owner, resourceId } = getConfiguration();
    const identifier = newIdentifier();
    /** @type {string} */
    let etagBeforeWrite = "";
    /** @type {string} */
    let etagAfterWrite = "";

    group("Conditional read with If-None-Match", function () {
        AccessListCreateOrUpdate(client, owner, identifier, {
            name: `k6 etag ${identifier}`,
            description: "Created by the resource-registry ETag test",
        }, readLabel);

        const read = client.AccessListGet(owner, identifier, null, {}, readLabel);

        AccessListDomainChecks.CheckStatus(read, 200, "AccessListGet");
        etagBeforeWrite = requireEtag(read, "AccessListGet");

        const unchanged = client.AccessListGet(owner, identifier, null, { "If-None-Match": etagBeforeWrite }, readLabel);

        AccessListDomainChecks.CheckStatus(unchanged, 304, "AccessListGet with matching If-None-Match");

        const members = client.AccessListGetMembers(owner, identifier, null, { "If-None-Match": etagBeforeWrite }, readLabel);

        AccessListDomainChecks.CheckStatus(members, 304, "AccessListGetMembers with matching If-None-Match");
    });

    group("Conditional write with If-Match", function () {
        const connection = { actionFilters: ["read"] };

        const current = client.AccessListUpsertResourceConnection(owner, identifier, resourceId, connection, { "If-Match": etagBeforeWrite }, writeLabel);

        AccessListDomainChecks.CheckStatus(current, 200, "AccessListUpsertResourceConnection with current If-Match");
        etagAfterWrite = requireEtag(current, "AccessListUpsertResourceConnection");
        AccessListDomainChecks.CheckEtagChanged(etagBeforeWrite, etagAfterWrite, "AccessListUpsertResourceConnection");

        const stale = expectingStatus(412, () => client.AccessListUpsertResourceConnection(
            owner,
            identifier,
            resourceId,
            { actionFilters: ["read", "write"] },
            { "If-Match": etagBeforeWrite },
            writeLabel,
        ));

        AccessListDomainChecks.CheckStatus(stale, 412, "AccessListUpsertResourceConnection with stale If-Match");

        const connections = client.AccessListGetResourceConnections(owner, identifier, null, {}, writeLabel);

        AccessListDomainChecks.CheckStatus(connections, 200, "AccessListGetResourceConnections after rejected write");
        AccessListDomainChecks.CheckResourceConnections(
            JSON.parse(String(connections.body)).data,
            [{ resourceIdentifier: resourceId, actionFilters: connection.actionFilters }],
            "AccessListGetResourceConnections after rejected write",
        );
    });

    group("Conditional delete with If-Match", function () {
        const stale = expectingStatus(412, () => client.AccessListDelete(owner, identifier, { "If-Match": etagBeforeWrite }, deleteLabel));

        AccessListDomainChecks.CheckStatus(stale, 412, "AccessListDelete with stale If-Match");

        const stillThere = client.AccessListGet(owner, identifier, null, {}, deleteLabel);

        AccessListDomainChecks.CheckStatus(stillThere, 200, "AccessListGet after rejected delete");

        const deleted = client.AccessListDelete(owner, identifier, { "If-Match": etagAfterWrite }, deleteLabel);

        AccessListDomainChecks.CheckStatus(deleted, 200, "AccessListDelete with current If-Match");

        const gone = expectingStatus(404, () => client.AccessListGet(owner, identifier, null, {}, deleteLabel));

        AccessListDomainChecks.CheckStatus(gone, 404, "AccessListGet after delete");
    });
}

/**
 * Deletes whatever lists the run left behind.
 */
export function teardown() {
    const deleted = deleteTestLists();

    if (deleted > 0) {
        console.warn(`teardown - deleted ${deleted} access list(s) the test left behind`);
    }
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
