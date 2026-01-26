import { check } from "k6";
import { RegisterApiClient } from "../../../clients/authentication/index.js";

/**
 *
 * @param {RegisterApiClient} registerClient
 * @param {string } facilitatorPartyUuid
 * @param {string } subscriptionKey
 * @returns {[]}
 */
export function GetRevisorCustomerIdentifiersForParty(
    registerClient,
    facilitatorPartyUuid,
    subscriptionKey,
) {
    const res = registerClient.GetRevisorCustomerIdentifiersForParty(
        facilitatorPartyUuid,
        subscriptionKey,
    );

    const success = check(res, {
        "Register customer list for revisor should respond 200 OK": (r) =>
            r.status === 200,
        "Register customer list for revisor response body is not empty": (r) =>
            r.body !== null && r.body !== undefined,
    });
    if (!success) {
        console.error(res.status);
        console.error(res.body);
        return [];
    }

    const body = JSON.parse(res.body);
    return (body.data ?? []).map((entry) => entry.organizationIdentifier);
}
