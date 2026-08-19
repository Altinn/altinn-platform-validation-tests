import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the right holders of a reportee of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} partyUuid Party UUID of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<User>|null} The right holders of the reportee.
 */
export function GetReporteeList(userClient, partyUuid, labels = null) {
    const res = withRetries(
        () => userClient.GetReporteeList(partyUuid, labels),
        "GetReporteeList",
    );

    /** @type {Array<User>|null} */
    let rightHolders = null;

    const succeed = check(res, {
        "GetReporteeList - status code is 200": (r) =>
            r.status === 200,
        "GetReporteeList - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rightHolders;
    }

    check(res, {
        "GetReporteeList - body is valid": (r) => {
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
