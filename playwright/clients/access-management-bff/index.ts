import { APIRequestContext } from "@playwright/test";

import { ConnectionClient } from "./connection";
import { UserClient } from "./user";

// BFF-en til Tilgangsstyring svarer på samme host som frontenden, så baseUrl er urler.tilgangsstyring.
export class AccessManagementBffApiClient {
    readonly connection: ConnectionClient;
    readonly user: UserClient;

    constructor(request: APIRequestContext, baseUrl: string) {
        this.connection = new ConnectionClient(request, baseUrl);
        this.user = new UserClient(request, baseUrl);
    }
}
