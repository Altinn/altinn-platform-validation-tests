import { check } from "k6";
import { ResourceRegistryApiClient } from "../../../../clients/auth/index.js";

/**
 * Get Updated Resources
 * @param {ResourceRegistryApiClient} resourceRegistryClient A client to interact with the Resource Registry API
 * @param {string} since ISO 8601 timestamp, e.g. 2000-01-01T01:00:00.000Z
 * @param {number} limit Number of resources to return per page 10
 * @param {string|null} label Label for the request
 * @returns {Object} Parsed JSON response
 */
export function GetUpdatedResources(resourceRegistryClient, since, limit, label = null) {
    const res = resourceRegistryClient.GetUpdatedResources(since, limit, label);

    let resBody = null;

    resBody = res.json();

    const succeed = check(res, {
        "GetUpdatedResources - status code is 200": (r) => r.status === 200,
        "GetUpdatedResources - status text is 200 OK": (r) =>
            r.status_text == "200 OK",
        "GetUpdatedResources - body is not empty": () => {
            return resBody !== null && resBody !== undefined;
        },
    });

    if (!succeed) {
        console.log("Response status:", res.status);
        console.log("Response body:", res.body);
    }

    return resBody;
}
