import { check } from "k6";

import { RequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Retrieves system user requests by system.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} systemId System identifier.
 * @param {GuidOpaque|null} [token] Continuation token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestSystemResponsePaginated|null} Paginated request responses.
 */
export function RequestSystemUserVendorGetBySystem(
    requestSystemUserClient,
    systemId,
    token = null,
    labels = null,
) {
    const res = requestSystemUserClient.RequestSystemUserVendorGetBySystem(
        systemId,
        token,
        labels,
    );

    /** @type {RequestSystemResponsePaginated|null} */
    let requestResponses = null;

    const succeed = check(res, {
        "RequestSystemUserVendorGetBySystem - status code is 200": (r) =>
            r.status === 200,
        "RequestSystemUserVendorGetBySystem - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponses;
    }

    check(res, {
        "RequestSystemUserVendorGetBySystem - body is valid": (r) => {
            try {
                requestResponses = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponses;
}
