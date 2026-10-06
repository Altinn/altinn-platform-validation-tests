import { APIRequestContext, APIResponse } from "@playwright/test";

// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class UserClient {
    constructor(
        private readonly request: APIRequestContext,
        private readonly baseUrl: string,
    ) {}

    /**
     * Aktørene brukeren tokenet tilhører kan representere, slik aktørvelgeren i headeren
     * henter dem. Svarer 200 med en liste AuthorizedParty.
     *
     * GET /accessmanagement/api/v1/user/actorlist/old
     */
    GetReporteeListForUser(token: string): Promise<APIResponse> {
        return this.request.get(`${this.baseUrl}/accessmanagement/api/v1/user/actorlist/old`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}
