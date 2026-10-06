import { APIRequestContext } from "@playwright/test";

import { InstancesClient } from "./instances";

export class StorageApiClient {
    readonly instances: InstancesClient;

    constructor(request: APIRequestContext, baseUrl: string) {
        this.instances = new InstancesClient(request, baseUrl);
    }
}
