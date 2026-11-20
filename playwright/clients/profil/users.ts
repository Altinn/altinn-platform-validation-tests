import { APIRequestContext, APIResponse } from "@playwright/test";

// Portert fra K6/clients/profil/users/users.js, med bare det testene bruker.
// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class UsersClient {
    private readonly path: string;

    constructor(
        private readonly request: APIRequestContext,
        platformUrl: string,
    ) {
        this.path = `${platformUrl}/profile/api/v1/users`;
    }

    /**
     * Profilen til brukeren tokenet tilhører. Svarer 200 med {@link UserProfile}.
     *
     * GET /profile/api/v1/users/current
     */
    GetCurrentUser(token: string): Promise<APIResponse> {
        return this.request.get(`${this.path}/current`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

/** Det testene leser av UserProfile. Personopplysningene kommer fra Folkeregisteret via Register. */
export type UserProfile = {
    party?: {
        person?: {
            // Postadressen med postnummer og poststed, for eksempel "Teatergaten 50 5010 BERGEN".
            mailingAddress?: string | null;
        } | null;
    } | null;
};
