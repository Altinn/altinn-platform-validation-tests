import { GetUpdatedResources } from "../../../building_blocks/auth/resourceregistry/index.js";
import { ResourceRegistryApiClient } from "../../../../clients/auth/index.js";

let resourceRegistryApiClient = undefined;

export default function () {
    if (resourceRegistryApiClient == undefined) {
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL);
    }
    GetUpdatedResources(resourceRegistryApiClient, "2000-01-01T01:00:00.000Z", 10);
}
