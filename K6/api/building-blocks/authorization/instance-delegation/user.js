import { check } from "k6";

import { BffUserApiClient } from "../../../../clients/authorization/bff-user.js";

/**
 * Get user id by lookup
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 */
export function GetLookupPartyUser(bffUserApiClient, labels = null) {
    const res = bffUserApiClient.GetLookupPartUser(labels);
    checker(res, "Get user id by lookup");
    return res.body;
}

/**
 * Post single right for the specified query parameters
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetIsCompanyProfileAdmin(bffUserApiClient, queryParams, labels = null) {
    const res = bffUserApiClient.GetIsCompanyProfileAdmin(queryParams, labels);
    checker(res, "Get is hoved admin");
    return res.body;
}

/**
 * Get reportee for the specified user id
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {*} userId - id of the user to get reportees for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 */
export function GetReportee(bffUserApiClient, userId, labels = null) {
    const res = bffUserApiClient.GetReportee(userId, labels);
    checker(res, "Get reportee");
    return res.body;
}

/**
 * Get profile
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 */
export function GetProfile(bffUserApiClient, labels = null) {
    const res = bffUserApiClient.GetProfile(labels);
    checker(res, "Get profile");
    return res.body;
}

/**
 * Get is admin
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 * */
export function GetIsAdmin(bffUserApiClient, queryParams, labels = null) {
    const res = bffUserApiClient.GetIsAdmin(queryParams, labels);
    checker(res, "Get is admin");
    return res.body;
}

/**
 * Get is client admin
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 * */
export function GetIsClientAdmin(bffUserApiClient, queryParams, labels = null) {
    const res = bffUserApiClient.GetIsClientAdmin(queryParams, labels);
    checker(res, "Get is client admin");
    return res.body;
}

/**
 * Get actor list old
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 * */
export function GetActorListOld(bffUserApiClient, labels = null) {
    const res = bffUserApiClient.GetActorListOld(labels);
    checker(res, "Get actor list old");
    return res.body;
}

/**
 * Get actor list favorites
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 * */
export function GetActorListFavorites(bffUserApiClient, labels = null) {
    const res = bffUserApiClient.GetActorListFavorites(labels);
    checker(res, "Get actor list favorites");
    return res.body;
}

/**
 * Get is instance admin
 *
 * @param {BffUserApiClient} bffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse
 */
export function GetIsInstanceAdmin(bffUserApiClient, queryParams, labels = null) {
    const res = bffUserApiClient.GetIsInstanceAdmin(queryParams, labels);
    checker(res, "Get is instance admin");
    return res.body;
}

/**
 * Function to check common response properties
 *
 * @param {} res - response object
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
