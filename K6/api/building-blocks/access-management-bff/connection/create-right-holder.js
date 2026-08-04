import { check } from "k6";

import { ConnectionClient } from "../../../../../clients/access-management-bff/connection/index.js";

/**
 * Adds a right holder to a reportee.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {string} partyUuid Party UUID of the reportee.
 * @param {CreateRightHolderQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateRightHolderQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} Party UUID of the added right holder.
 */
export function CreateRightHolder(
    connectionClient,
    partyUuid,
    queryParams = null,
    labels = null,
) {
    const res = connectionClient.CreateRightHolder(
        partyUuid,
        queryParams,
        labels,
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
