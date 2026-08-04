import { check } from "k6";

import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";

/**
 * Validates a person before adding them as a right holder.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {string} partyUuid Party UUID of the reportee.
 * @param {ValidatePersonInput|null} [body] The person to validate. Use
 * {@link ValidatePersonInputBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Party UUID of the validated person.
 */
export function ValidatePerson(
    connectionClient,
    partyUuid,
    body = null,
    labels = null,
) {
    const res = connectionClient.ValidatePerson(partyUuid, body, labels);

    /** @type {string|null} */
    let validatedPartyUuid = null;

    const succeed = check(res, {
        "ValidatePerson - status code is 200": (r) =>
            r.status === 200,
        "ValidatePerson - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return validatedPartyUuid;
    }

    validatedPartyUuid = res.body;

    return validatedPartyUuid;
}
