import { APIRequestContext, APIResponse } from "@playwright/test";

import { GetRightholdersQuery, RevokeRightHolderQuery } from "./types";

// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class ConnectionClient {
    constructor(
        private readonly request: APIRequestContext,
        private readonly baseUrl: string,
    ) {}

    /**
     * Koblingene en part har som rettighetshaver eller avgiver.
     *
     * GET /accessmanagement/api/v1/connection/rightholders
     */
    GetRightholders(token: string, query: GetRightholdersQuery): Promise<APIResponse> {
        return this.request.get(`${this.baseUrl}/accessmanagement/api/v1/connection/rightholders`, {
            headers: { Authorization: `Bearer ${token}` },
            params: query,
        });
    }

    /**
     * Fjerner koblingen mellom avgiver og rettighetshaver, med tilgangspakkene som er gitt.
     *
     * DELETE /accessmanagement/api/v1/connection/reportee
     */
    RevokeRightHolder(token: string, query: RevokeRightHolderQuery): Promise<APIResponse> {
        return this.request.delete(`${this.baseUrl}/accessmanagement/api/v1/connection/reportee`, {
            headers: { Authorization: `Bearer ${token}` },
            params: query,
        });
    }
}
