import { APIRequestContext } from "@playwright/test";

import { Urler } from "../config/environment";
import { AccessManagementBffApiClient } from "./access-management-bff";
import { AppsApiClient } from "./apps";
import { CorrespondenceApiClient } from "./correspondence";
import { withRetries } from "./retry";
import { TokenGeneratorClient } from "./token-generator";

// Klientene opprettes først når en test bruker dem.
export class ApiClient {
    private readonly request: APIRequestContext;
    private _accessManagementBff?: AccessManagementBffApiClient;
    private _apps?: AppsApiClient;
    private _correspondence?: CorrespondenceApiClient;
    private _tokenGenerator?: TokenGeneratorClient;

    constructor(
        request: APIRequestContext,
        private readonly urler: Urler,
    ) {
        this.request = withRetries(request);
    }

    get accessManagementBff(): AccessManagementBffApiClient {
        return (this._accessManagementBff ??= new AccessManagementBffApiClient(this.request, this.urler.tilgangsstyring));
    }

    get apps(): AppsApiClient {
        return (this._apps ??= new AppsApiClient(this.request, this.urler.apps));
    }

    get correspondence(): CorrespondenceApiClient {
        return (this._correspondence ??= new CorrespondenceApiClient(this.request, this.urler.platform));
    }

    get tokenGenerator(): TokenGeneratorClient {
        return (this._tokenGenerator ??= new TokenGeneratorClient(this.request));
    }
}
