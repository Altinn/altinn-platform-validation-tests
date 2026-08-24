import { check } from "k6";

import { RegisterClient } from "../../../clients/register/index.js";
import {
    Party,
    PartyFieldInclude,
} from "../../../clients/register/types.js";
import { withRetries } from "../common/retry.js";

/**
 * Gets the customers of a party for one of its Enhetsregisteret roles: the
 * parties that have assigned that role to it.
 *
 * The role is part of the check names, so a test that reads customers for more
 * than one role can tell which of them failed.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} partyUuid The party whose customers to get.
 * @param {string} ccrRole The role the customers have assigned, from
 * CcrCustomerRoles, e.g. "revisor".
 * @param {Array<PartyFieldInclude>} [fields] The party fields to include.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<Party>|null} The customer parties, or null on failure.
 */
export function GetCustomers(
    registerClient,
    partyUuid,
    ccrRole,
    fields = null,
    labels = null,
) {
    const res = withRetries(
        () => registerClient.GetCustomers(partyUuid, ccrRole, fields, labels),
        `GetCustomers(${ccrRole})`,
    );

    /** @type {Array<Party>|null} */
    let customers = null;

    const succeed = check(res, {
        [`GetCustomers(${ccrRole}) - status code is 200`]: (r) => r.status === 200,
        [`GetCustomers(${ccrRole}) - status text is 200 OK`]: (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return customers;
    }

    check(res, {
        [`GetCustomers(${ccrRole}) - body is valid`]: (r) => {
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
