import { APIRequestContext } from "@playwright/test";

import { ConnectionClient } from "./connection";

export class AccessManagementBffApiClient {
    private _connection?: ConnectionClient;

    constructor(
        private readonly request: APIRequestContext,
        private readonly baseUrl: string,
    ) {}

    get connection(): ConnectionClient {
        return (this._connection ??= new ConnectionClient(this.request, this.baseUrl));
    }
}
