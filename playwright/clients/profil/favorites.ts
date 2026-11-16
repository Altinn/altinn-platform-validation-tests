import { APIRequestContext, APIResponse } from "@playwright/test";

// Portert fra K6/clients/profil/favorites/favorites.js, med bare det testene bruker.
// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class FavoritesClient {
    private readonly path: string;

    constructor(
        private readonly request: APIRequestContext,
        platformUrl: string,
    ) {
        this.path = `${platformUrl}/profile/api/v1/users/current/party-groups/favorites`;
    }

    /**
     * Favorittaktørene til brukeren tokenet tilhører. Svarer 200 med {@link GroupResponse}.
     *
     * GET /profile/api/v1/users/current/party-groups/favorites
     */
    GetFavorites(token: string): Promise<APIResponse> {
        return this.request.get(this.path, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Fjerner aktøren fra favorittene til brukeren tokenet tilhører.
     *
     * DELETE /profile/api/v1/users/current/party-groups/favorites/{partyUuid}
     */
    DeleteFavorite(token: string, partyUuid: string): Promise<APIResponse> {
        return this.request.delete(`${this.path}/${partyUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

/** En gruppe aktører, her favorittene. `parties` er party UUID-ene. */
export type GroupResponse = {
    groupId: number;
    name?: string | null;
    isFavorite: boolean;
    parties?: string[] | null;
};
