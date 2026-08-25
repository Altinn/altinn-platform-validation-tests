import { check } from "k6";

import { AuthorizedParty } from "../../../../clients/access-management-bff/common/common.types.js";
import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a reportee of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} partyUuid Party UUID of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AuthorizedParty|null} The reportee.
 */
export function GetReportee(userClient, partyUuid, labels = null) {
    const res = withRetries(
        () => userClient.GetReportee(partyUuid, labels),
        "GetReportee",
    );

    /** @type {AuthorizedParty|null} */
    let reportee = null;

    const succeed = check(res, {
        "GetReportee - status code is 200": (r) =>
            r.status === 200,
        "GetReportee - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return reportee;
    }

    check(res, {
        "GetReportee - body is valid": (r) => {
            try {
                reportee = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return reportee;
}
