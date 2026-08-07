import { check } from "k6";

import { RegisterClient } from "../../../clients/register/index.js";
import {
    Party,
    PartyFieldInclude,
} from "../../../clients/register/types.js";
import { withRetries } from "../common/retry.js";

/**
 * Gets the customers of an auditor: the parties that have assigned the `revisor`
 * role from Enhetsregisteret to the given party.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} partyUuid The revisor party UUID.
 * @param {Array<PartyFieldInclude>} [fields] The party fields to include.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<Party>|null} The customer parties, or null on failure.
 */
export function GetRevisorCustomers(
    registerClient,
    partyUuid,
    fields = null,
    labels = null,
) {
    const res = withRetries(
        () => registerClient.GetRevisorCustomers(partyUuid, fields, labels),
        "GetRevisorCustomers",
    );

    /** @type {Array<Party>|null} */
    let customers = null;

    const succeed = check(res, {
        "GetRevisorCustomers - status code is 200": (r) => r.status === 200,
        "GetRevisorCustomers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return customers;
    }

    check(res, {
        "GetRevisorCustomers - body is valid": (r) => {
            try {
                customers = JSON.parse(r.body).data ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return customers;
}
