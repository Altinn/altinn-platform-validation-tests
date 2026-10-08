import { APIRequestContext } from "@playwright/test";

import { InstancesClient } from "./instances";

export class AppsApiClient {
    readonly instances: InstancesClient;

    constructor(request: APIRequestContext, baseUrl: string) {
        this.instances = new InstancesClient(request, baseUrl);
    }
}
