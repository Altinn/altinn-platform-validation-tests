import { APIRequestContext } from "@playwright/test";

import { AuthorizedPartiesClient } from "./authorized-parties";

export class AccessManagementApiClient {
    private _authorizedParties?: AuthorizedPartiesClient;

    constructor(
        private readonly request: APIRequestContext,
        private readonly platformUrl: string,
    ) {}

    get authorizedParties(): AuthorizedPartiesClient {
        return (this._authorizedParties ??= new AuthorizedPartiesClient(this.request, this.platformUrl));
    }
}
