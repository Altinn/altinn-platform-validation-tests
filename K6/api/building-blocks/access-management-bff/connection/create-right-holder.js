import { check } from "k6";

import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds a right holder to a reportee.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {string} partyUuid Party UUID of the reportee.
 * @param {ValidatePersonInput|null} [body] The person to add, when they are
 * identified by national identity number. Use
 * {@link ValidatePersonInputBuilder}.
 * @param {CreateRightHolderQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateRightHolderQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Party UUID of the added right holder.
 */
export function CreateRightHolder(
    connectionClient,
    partyUuid,
    body = null,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionClient.CreateRightHolder(
            partyUuid,
            body,
            queryParams,
            labels,
        ),
        "CreateRightHolder",
    );

    /** @type {string|null} */
    let rightHolderPartyUuid = null;

    const succeed = check(res, {
        "CreateRightHolder - status code is 200": (r) =>
            r.status === 200,
        "CreateRightHolder - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rightHolderPartyUuid;
    }

    rightHolderPartyUuid = res.body;

    return rightHolderPartyUuid;
}
