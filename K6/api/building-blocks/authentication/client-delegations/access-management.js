import { BffAccessManagementApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Post single right for the specified query parameters
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetIsHovedAdmin(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetIsHovedAdmin(queryParams, label);
    checker(res, "Get is hoved admin");
    return res.body;
}

/**
 * Get permissions for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetRolePermissions(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetRolePermissions(queryParams, label);
    checker(res, "Get role permissions");
    return res.body;
}

/**
 * Get delegated resources for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function GetDelegatedResources(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetDelegatedResources(queryParams, label);
    checker(res, "Get delegated resources");
    return res.body;
}

/**
 * Get delegated rights for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * @return (string | ArrayBuffer | null)
 */
export function GetDelegatedRightsForResource(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetDelegatedRightsForResource(queryParams, label);
    checker(res, "Get delegated rights for resource");
    return res.body;
}

/**
 *  Get search for access packages
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * @return (string | ArrayBuffer | null)
 */
export function SearchAccessPackages(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.SearchAccessPackages(queryParams, label);
    checker(res, "search access packages");
    return res.body;
}

/**
 * Get search for resources
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function SearchResources(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.SearchResources(queryParams, label);
    checker(res, "search resources");
    return res.body;
}

/**
 * Get resource owners for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetResourceOwners(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetResourceOwners(queryParams, label);
    checker(res, "Get resource owners");
    return res.body;
}

/**
 *  Get organizational data for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetOrganizationData(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetOrganizationData(queryParams, label);
    checker(res, "Get organization data");
    return res.body;
}

/**
 * Get organizational data from lookup for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {*} orgNo - organization number to lookup
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetOrganizationDataFromLookup(bffAccessManagementApiClient, orgNo, label = null) {
    const res = bffAccessManagementApiClient.GetOrganizationDataFromLookup(orgNo, label);
    checker(res, "Get organization data from lookup");
    return res.body;
}

/**
 * Get role metadata
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetRoleMeta(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetRoleMeta(queryParams, label);
    checker(res, "Get role meta");
    return res.body;
}

/**
 * Get rights metadata for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API    
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetRightsMeta(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetRightsMeta(queryParams, label);
    checker(res, "Get rights meta");
    return res.body;
}

/**
 * Get delegated instances for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetDelegatedInstancesForResource(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetDelegatedInstancesForResource(queryParams, label);
    checker(res, "Get delegated instances for resource");
    return res.body;
}

/**
 * Get delegation check for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 * */
export function CheckDelegationForResource(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.CheckDelegationForResource(queryParams, label);
    checker(res, "Get delegation check for resource");
    return res.body;
}

/**
 * Post delegated rights for a resource
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} body - body for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function DelegateRightsForResource(bffAccessManagementApiClient, queryParams, body, label = null) {
    const res = bffAccessManagementApiClient.DelegateRightsForResource(queryParams, body, label);
    checker(res, "Post delegated rights for resource", 200);
    return res.body;
}

/**
 * Get active consent for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetActiveConsent(bffAccessManagementApiClient, uuid, label = null) {
    const res = bffAccessManagementApiClient.GetActiveConsentsForUser(uuid, label);
    checker(res, "Get active consent");
    return res.body;
}

/**
 * Get resource by id
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetResourceById(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.GetResourceById(queryParams, label);
    checker(res, "Get resource by id");
    return res.body;
}

/**
 * Get pending delegations for a user
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} uuid - uuid for the user
 * @param {*} label - label for the request
 * return (string | ArrayBuffer | null)
 */
export function GetPendingDelegationsForUser(bffAccessManagementApiClient, uuid, label = null) {
    const res = bffAccessManagementApiClient.GetPendingDelegationsForUser(uuid, label);
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
