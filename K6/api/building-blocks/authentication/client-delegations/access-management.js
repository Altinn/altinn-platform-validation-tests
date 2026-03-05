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

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/singleright/delegation/resources/rights?party=5b0220fb-ed4b-474c-b648-135fd29c509b&to=223c8f0e-3887-4dba-8e2b-45ace76decfd&from=5b0220fb-ed4b-474c-b648-135fd29c509b&resourceId=testressurs-tilgangspakke-org-damp-varmtvann-1
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

//// Del https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/reportee?party=0d8e92cb-febc-46df-bf38-0540a084bfb1&to=f1399084-2814-4f54-ab0e-75a931628762&from=0d8e92cb-febc-46df-bf38-0540a084bfb1
/**
 * Delete rightholder connection for a reportee
 * @param {BffAccessManagementApiClient} BffAccessManagementApiClient A client to interact with the user API
 * @param {} queryParams - queryParams for the request
 * @param {*} label - label for the request
 */
export function DeleteRightholderConnection(bffAccessManagementApiClient, queryParams, label = null) {
    const res = bffAccessManagementApiClient.DeleteRightholderConnection(queryParams, label);
    const succeed = check(res, {
        [`delete rightholder - status code is 204`]: (r) => r.status === 204,
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    };
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
