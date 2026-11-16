import { APIRequestContext } from "@playwright/test";

import { FavoritesClient } from "./favorites";

export class ProfilApiClient {
    private _favorites?: FavoritesClient;

    constructor(
        private readonly request: APIRequestContext,
        private readonly platformUrl: string,
    ) {}

    get favorites(): FavoritesClient {
        return (this._favorites ??= new FavoritesClient(this.request, this.platformUrl));
    }
}
