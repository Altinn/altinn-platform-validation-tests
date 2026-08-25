import { check } from "k6";

import { InfoPortalApiClient } from "../../../clients/infoportal/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Get Authorized Parties
 *
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Authorized parties for the user
 */
export function GetAuthorizedParties(infoPortalApiClient, labels = null) {
    const res = withRetries(
        () => infoPortalApiClient.GetAuthorizedParties(labels),
        "GetAuthorizedParties",
    );
    checker(res, "GetAuthorizedParties");
    return res.json();
}

/**
 * Get favorites
 *
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Favorites for the user
 */
export function GetFavorites(infoPortalApiClient, labels = null) {
    const res = withRetries(
        () => infoPortalApiClient.GetFavorites(labels),
        "GetFavorites",
    );
    checker(res, "GetFavorites");
    return res.json();
}

/**
 * Get current
 *
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Current user info
 */

export function GetCurrent(infoPortalApiClient, labels = null) {
    const res = withRetries(
        () => infoPortalApiClient.GetCurrent(labels),
        "GetCurrent",
    );
    checker(res, "GetCurrent");
    return res.json();
}

/**
 * Function to check common response properties
 *
 * @param {import("k6/http").RefinedResponse<"text">} res - response object
 * @param {*} method - method name for logging
 * @param status_code TODO: description
 * @param status_text TODO: description
 */
function checker(res, method, status_code = 200, status_text = "200 OK") {
    const succeed = check(res, {
        [`${method} - status code is ${status_code}`]: (r) => r.status === status_code,
        [`${method} - status text is ${status_text}`]: (r) => r.status_text == status_text,
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    };
}
