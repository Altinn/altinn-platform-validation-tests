import { check } from "k6";
import { RegisterLookupClient } from "../../../clients/authentication/index.js";

/**
 * Fetches a stream of ExternalRoleAssignmentEvent objects from the v2 internal endpoint.
 * Omit token to start from the beginning; pass the last versionId to get events since then.
 *
 * Each event contains: versionId, type (Added|Removed), roleSource, roleIdentifier, fromParty, toParty
 *
 * @param {RegisterLookupClient} lookupClient
 * @param {string|null} token - Opaque continuation token (last versionId). Omit to start from beginning.
 * @returns {import("k6/http").RefinedResponse}
 */
export function GetExternalRoleAssignmentEvents(lookupClient, token = null) {
    const res = lookupClient.GetExternalRoleAssignmentEvents(token);

    check(res, {
        "GetExternalRoleAssignmentEvents - status code should be 200": (r) => r.status === 200,
    });

    return res;
}
