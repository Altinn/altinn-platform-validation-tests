import { check } from "k6";
import { BffUserApiClient } from "../../../../clients/authentication/bff-user.js";

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/lookup/party/user
/**
 * Get user id by lookup
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 */
export function GetLookupPartyUser(bffUserApiClient, label = null) {
    const res = bffUserApiClient.GetLookupPartUser(label);
    checker(res, "Get user id by lookup");
    return res.body;
}
/**
 * Post single right for the specified query parameters
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetIsCompanyProfileAdmin(bffUserApiClient, queryParams, label = null) {
    const res = bffUserApiClient.GetIsCompanyProfileAdmin(queryParams, label);
    checker(res, "Get is hoved admin");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/reportee/50508927
/**
 * Get reportee for the specified user id
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {*} userId - id of the user to get reportees for
 * @param {*} label - label for the request
 * returns http.RefinedResponse 
 */
export function GetReportee(bffUserApiClient, userId, label = null) {
    const res = bffUserApiClient.GetReportee(userId, label);
    checker(res, "Get reportee");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/profile
/**
 * Get profile
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {*} label - label for the request
 * @returns http.RefinedResponse 
 */
export function GetProfile(bffUserApiClient, label = null) {
    const res = bffUserApiClient.GetProfile(label);
    checker(res, "Get profile");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
/**
 * Get is admin
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 * */
export function GetIsAdmin(bffUserApiClient, queryParams, label = null) {
    const res = bffUserApiClient.GetIsAdmin(queryParams, label);
    checker(res, "Get is admin");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isClientAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
/**
 * Get is client admin
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 * */
export function GetIsClientAdmin(bffUserApiClient, queryParams, label = null) {
    const res = bffUserApiClient.GetIsClientAdmin(queryParams, label);
    checker(res, "Get is client admin");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/sent?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/received?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/old
/**
 * Get actor list old
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 * */
export function GetActorListOld(bffUserApiClient, label = null) {
    const res = bffUserApiClient.GetActorListOld(label);
    checker(res, "Get actor list old");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/favorites
/**
 * Get actor list favorites
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 * */
export function GetActorListFavorites(bffUserApiClient, label = null) {
    const res = bffUserApiClient.GetActorListFavorites(label);
    checker(res, "Get actor list favorites");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/cdn/orgdata
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isInstanceAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
/**
 * Get is instance admin
 * @param {BffUserApiClient} BffUserApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * returns http.RefinedResponse
 */
export function GetIsInstanceAdmin(bffUserApiClient, queryParams, label = null) {
    const res = bffUserApiClient.GetIsInstanceAdmin(queryParams, label);
    checker(res, "Get is instance admin");
    return res.body;
}

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/consent/active/5f453a8c-86e2-4bef-bbd9-6235edf414f0
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&includeClientDelegations=true&includeAgentConnections=true
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/resources?resourceId=k6-instancedelegation-test
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/accesspackage/delegationcheck?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/rightholders?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=5f453a8c-86e2-4bef-bbd9-6235edf414f0&includeClientDelegations=true&includeAgentConnections=

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
