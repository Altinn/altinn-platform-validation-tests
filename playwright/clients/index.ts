import { APIRequestContext } from "@playwright/test";

import { Urler } from "../config/environment";
import { AccessManagementBffApiClient } from "./access-management-bff";
import { AppsApiClient } from "./apps";
import { medRetries } from "./retry";

export class ApiClient {
    readonly accessManagementBff: AccessManagementBffApiClient;
    readonly apps: AppsApiClient;

    constructor(request: APIRequestContext, urler: Urler) {
        request = medRetries(request);
        this.accessManagementBff = new AccessManagementBffApiClient(request, urler.tilgangsstyring);
        this.apps = new AppsApiClient(request, urler.apps);
    }
}
