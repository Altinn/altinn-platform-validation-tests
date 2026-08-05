import { check } from "k6";

import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";

/**
 * Gets the right holders of a reportee.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {number} partyId Party id of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<User>|null} The right holders of the reportee.
 */
export function GetReporteeRightHolders(
    connectionClient,
    partyId,
    labels = null,
) {
    const res = connectionClient.GetReporteeRightHolders(partyId, labels);

    /** @type {Array<User>|null} */
    let rightHolders = null;

    const succeed = check(res, {
        "GetReporteeRightHolders - status code is 200": (r) =>
            r.status === 200,
        "GetReporteeRightHolders - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rightHolders;
    }

    check(res, {
        "GetReporteeRightHolders - body is valid": (r) => {
            try {
                rightHolders = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rightHolders;
}
