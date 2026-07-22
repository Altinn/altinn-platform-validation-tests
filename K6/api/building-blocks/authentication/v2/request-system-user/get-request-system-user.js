import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/request-system-user/index.js";

/**
 * Retrieves a system user request by id.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestSystemResponse|null} Request response.
 */
export function GetRequestSystemUser(
    requestSystemUserClient,
    requestId,
    labels = null,
) {
    const res = requestSystemUserClient.GetRequestSystemUser(
        requestId,
        labels,
    );

    /** @type {RequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "GetRequestSystemUser - status code is 200": (r) =>
            r.status === 200,
        "GetRequestSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "GetRequestSystemUser - body is valid": (r) => {
            try {
                requestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponse;
}
