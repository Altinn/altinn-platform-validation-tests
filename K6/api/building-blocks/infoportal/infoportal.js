import { check } from "k6";
import { InfoPortalApiClient } from "../../../clients/infoportal/index.js";

/**
 * Get Authorized Parties
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Authorized parties for the user
 */
export function GetAuthorizedParties(infoPortalApiClient, labels = null) {
    const res = infoPortalApiClient.GetAuthorizedParties(labels);
    checker(res, "GetAuthorizedParties");
    return res.json();
}

/**
 * Get favorites
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Favorites for the user
 */
export function GetFavorites(infoPortalApiClient, labels = null) {
    const res = infoPortalApiClient.GetFavorites(labels);
    checker(res, "GetFavorites");
    return res.json();
}

/**
 * Get current
 * @param {InfoPortalApiClient} infoPortalApiClient A client to interact with the info portal api
 * @param {*} labels Labels for k6 checks
 * @returns Current user info
 */

export function GetCurrent(infoPortalApiClient, labels = null) {
    const res = infoPortalApiClient.GetCurrent(labels);
    checker(res, "GetCurrent");
    return res.json();
}

/**
 * Function to check common response properties
 * @param {} res - response object
 * @param {*} method - method name for logging
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