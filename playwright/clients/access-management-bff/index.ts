import { APIRequestContext } from "@playwright/test";

import { ConnectionClient } from "./connection";

// BFF-en til Tilgangsstyring svarer på samme host som frontenden, så baseUrl er urler.tilgangsstyring.
export class AccessManagementBffApiClient {
    readonly connection: ConnectionClient;

    constructor(request: APIRequestContext, baseUrl: string) {
        this.connection = new ConnectionClient(request, baseUrl);
    }
}
