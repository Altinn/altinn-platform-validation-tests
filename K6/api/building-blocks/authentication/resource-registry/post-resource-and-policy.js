import { check } from "k6";
import { ResourceRegistryApiClient } from "../../../../clients/authentication/index.js";

/**
 * 
 * @param {ResourceRegistryApiClient} resourceRegistryClient A client to interact with the Resource Registry API
  * @param {string} resourceId - resource id
  * @param {string} org - organization number
  * @param {string} orgCode - organization code
 * @returns {Object} Parsed JSON response
 */
export function PostResourceAndPolicy(resourceRegistryClient, resourceId, org, orgCode) {
    const res = resourceRegistryClient.PostResource(resourceId, org, orgCode);
    let succeed = true;
    let succeedPolicy = false;

    succeed = check(res, {
        "GetUpdatedResources - status code is 201": (r) => r.status === 201,
    });

    if (succeed) {
        const resPolicy = resourceRegistryClient.PostPolicy(resourceId);
        succeedPolicy = check(resPolicy, {
            "PostPolicy - status code is 201": (r) => r.status === 201,
        });
        if (!succeedPolicy) {
            console.log("Post policy response status:", resPolicy.status);
            console.log("Post policy response body:", resPolicy.body);
        }
    } else {
        console.log("Post resource esponse status:", res.status);
    }

    return [succeed, succeedPolicy];
}

/**
 * 
 * @param {ResourceRegistryApiClient} resourceRegistryClient A client to interact with the Resource Registry API
  * @param {string} resourceId - resource id
  * @param {string} org - organization number
  * @param {string} orgCode - organization code
 * @returns {Object} Parsed JSON response
 */
export function PostResource(resourceRegistryClient, resourceId, org, orgCode) {
    const res = resourceRegistryClient.PostResource(resourceId, org, orgCode);

    const succeed = check(res, {
        "GetUpdatedResources - status code is 201": (r) => r.status === 201,
    });

    if (!succeed) {
        console.log("Post resource response status:", res.status);
        console.warn("Post resource response body");
    }

    return res;
}

/**
 * 
 * @param {ResourceRegistryApiClient} resourceRegistryClient A client to interact with the Resource Registry API
  * @param {string} resourceId - resource id
  * @param {string} org - organization number
  * @param {string} orgCode - organization code
 * @returns {Object} Parsed JSON response
 */
export function PostPolicy(resourceRegistryClient, resourceId, policyDefinition = null) {
    const res = resourceRegistryClient.PostPolicy(resourceId, policyDefinition);

    const succeed = check(res, {
        "GetUpdatedResources - status code is 201": (r) => r.status === 201,
    });

    if (!succeed) {
        console.log("Post policy response status:", res.status);
        console.warn("Post policy response body:", res.body);
    }

    return res;
}



