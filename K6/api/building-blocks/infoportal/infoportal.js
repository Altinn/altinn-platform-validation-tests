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
    const succeed = check(res, {
        "GetAuthorizedParties - status code is 200": (r) => r.status === 200,
    });
    logFailure(res, succeed);
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
    const succeed = check(res, {
        "GetFavorites - status code is 200": (r) => r.status === 200,
    });
    logFailure(res, succeed);
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
    const succeed = check(res, {
        "GetCurrent - status code is 200": (r) => r.status === 200,
    });
    logFailure(res, succeed);
    return res.json();
}

/**
 * Logs the status and body of a response whose status check failed.
 *
 * @param {import("k6/http").RefinedResponse<"text">} res - response object
 * @param {boolean} succeed - whether the status check passed
 */
function logFailure(res, succeed) {
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
}
