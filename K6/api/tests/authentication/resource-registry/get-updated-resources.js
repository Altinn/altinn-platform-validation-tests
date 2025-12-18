import { GetUpdatedResources } from "../../../building-blocks/authentication/resource-registry/index.js";
import { ResourceRegistryApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

let resourceRegistryApiClient = undefined;

export default function () {
    if (resourceRegistryApiClient == undefined) {
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL);
    }

    const expectedBaseUrl = resourceRegistryApiClient.baseUrl + "/resourceregistry/";

    const resBody = GetUpdatedResources(resourceRegistryApiClient, "2000-01-01T01:00:00.000Z", 10);

    const succeed = check(resBody, {
        "GetUpdatedResources - links.next exists": () => {
            return (
                resBody !== null &&
                resBody.links !== null &&
                resBody.links !== undefined &&
                resBody.links.next !== null &&
                resBody.links.next !== undefined
            );
        },
        "GetUpdatedResources - links.next starts with https://": () => {
            if (!resBody || !resBody.links || !resBody.links.next) {
                return false;
            }
            return resBody.links.next.startsWith("https://");
        },
        "GetUpdatedResources - links.next has correct domain": () => {
            if (!resBody || !resBody.links || !resBody.links.next) {
                return false;
            }
            return resBody.links.next.startsWith(expectedBaseUrl);
        },
    });

    if (!succeed) {
        if (resBody && resBody.links && resBody.links.next) {
            console.log("links.next:", resBody.links.next);
            console.log("Expected to start with:", expectedBaseUrl);
        }
    }
}
