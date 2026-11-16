import { APIRequestContext } from "@playwright/test";

import { FavoritesClient } from "./favorites";
import { UsersClient } from "./users";

export class ProfilApiClient {
    private _favorites?: FavoritesClient;
    private _users?: UsersClient;

    constructor(
        private readonly request: APIRequestContext,
        private readonly platformUrl: string,
    ) {}

    get favorites(): FavoritesClient {
        return (this._favorites ??= new FavoritesClient(this.request, this.platformUrl));
    }

    get users(): UsersClient {
        return (this._users ??= new UsersClient(this.request, this.platformUrl));
    }
}
