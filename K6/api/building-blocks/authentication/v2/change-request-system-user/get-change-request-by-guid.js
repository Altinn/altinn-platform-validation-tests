import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Retrieves a change request by id.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponse|null} Change request response.
 */
export function GetChangeRequestByGuid(
    changeRequestSystemUserClient,
    requestId,
    labels = null,
) {
    const res =
        changeRequestSystemUserClient.GetChangeRequestByGuid(
            requestId,
            labels,
        );

    /** @type {ChangeRequestResponse|null} */
    let changeRequestResponse = null;

    const succeed = check(res, {
        "GetChangeRequestByGuid - status code is 200": (r) =>
            r.status === 200,
        "GetChangeRequestByGuid - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeRequestResponse;
    }

    check(res, {
        "GetChangeRequestByGuid - body is valid": (r) => {
            try {
                changeRequestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changeRequestResponse;
}
