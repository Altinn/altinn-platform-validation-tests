import { APIRequestContext } from "@playwright/test";

import { InstancesClient } from "./instances";

export class AppsApiClient {
    private _instances?: InstancesClient;

    constructor(
        private readonly request: APIRequestContext,
        private readonly baseUrl: string,
    ) {}

    get instances(): InstancesClient {
        return (this._instances ??= new InstancesClient(this.request, this.baseUrl));
    }
}
