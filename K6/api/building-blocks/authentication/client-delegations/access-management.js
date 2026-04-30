import { BffAccessManagementApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Post single right for the specified query parameters
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 */
export function GetIsHovedAdmin(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetIsHovedAdmin(queryParams, labels);
    checker(res, "Get is hoved admin");
    return res.body;
}

/**
 * Get permissions for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 */
export function GetRolePermissions(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetRolePermissions(queryParams, labels);
    checker(res, "Get role permissions");
    return res.body;
}

/**
 * Get delegated resources for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 */
export function GetDelegatedResources(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetDelegatedResources(queryParams, labels);
    checker(res, "Get delegated resources");
    return res.body;
}

/**
 * Get delegated rights for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * @return (string | ArrayBuffer | null)
 */
export function GetDelegatedRightsForResource(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetDelegatedRightsForResource(queryParams, labels);
    checker(res, "Get delegated rights for resource");
    return res.body;
}

/**
 *  Get search for access packages
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * @return (string | ArrayBuffer | null)
 */
export function SearchAccessPackages(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.SearchAccessPackages(queryParams, labels);
    checker(res, "search access packages");
    return res.body;
}

/**
 * Get search for resources
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 */
export function SearchResources(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.SearchResources(queryParams, labels);
    checker(res, "search resources");
    return res.body;
}

/**
 * Get resource owners for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetResourceOwners(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetResourceOwners(queryParams, labels);
    checker(res, "Get resource owners");
    return res.body;
}

/**
 *  Get organizational data for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetOrganizationData(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetOrganizationData(queryParams, labels);
    checker(res, "Get organization data");
    return res.body;
}

/**
 * Get organizational data from lookup for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {*} orgNo - organization number to lookup
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetOrganizationDataFromLookup(bffAccessManagementApiClient, orgNo, labels = null) {
    const res = bffAccessManagementApiClient.GetOrganizationDataFromLookup(orgNo, labels);
    checker(res, "Get organization data from lookup");
    return res.body;
}

/**
 * Get role metadata
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetRoleMeta(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetRoleMeta(queryParams, labels);
    checker(res, "Get role meta");
    return res.body;
}

/**
 * Get rights metadata for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetRightsMeta(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetRightsMeta(queryParams, labels);
    checker(res, "Get rights meta");
    return res.body;
}

/**
 * Get delegated instances for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetDelegatedInstancesForResource(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetDelegatedInstancesForResource(queryParams, labels);
    checker(res, "Get delegated instances for resource");
    return res.body;
}

/**
 * Get delegation check for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 * */
export function CheckDelegationForResource(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.CheckDelegationForResource(queryParams, labels);
    checker(res, "Get delegation check for resource");
    return res.body;
}

/**
 * Post delegated rights for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} body - body for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function DelegateRightsForResource(bffAccessManagementApiClient, queryParams, body, labels = null) {
    const res = bffAccessManagementApiClient.DelegateRightsForResource(queryParams, body, labels);
    checker(res, "Post delegated rights for resource", 200);
    return res.body;
}

/**
 * Get active consent for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} uuid - uuid for the user
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetActiveConsent(bffAccessManagementApiClient, uuid, labels = null) {
    const res = bffAccessManagementApiClient.GetActiveConsentsForUser(uuid, labels);
    checker(res, "Get active consent");
    return res.body;
}

/**
 * Get consent log for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} uuid - uuid for the user
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetConsentLog(bffAccessManagementApiClient, uuid, labels = null) {
    const res = bffAccessManagementApiClient.GetConsentLogForUser(uuid, labels);
    checker(res, "Get consent log");
    return res.body;
}

/**
 * Get resource by id
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetResourceById(bffAccessManagementApiClient, queryParams, labels = null) {
    const res = bffAccessManagementApiClient.GetResourceById(queryParams, labels);
    checker(res, "Get resource by id");
    return res.body;
}

/**
 * Get pending delegations for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} uuid - uuid for the user
 * @param {*} labels - labels for the request
 * return (string | ArrayBuffer | null)
 */
export function GetPendingDelegationsForUser(bffAccessManagementApiClient, uuid, labels = null) {
    const res = bffAccessManagementApiClient.GetPendingDelegationsForUser(uuid, labels);
    checker(res, "Get pending delegations for user");
    return res.body;
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
