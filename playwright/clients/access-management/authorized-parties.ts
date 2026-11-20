import { APIRequestContext, APIResponse } from "@playwright/test";

// Portert fra K6/clients/access-management/enduser/authorized-parties, med bare det testene bruker.
// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class AuthorizedPartiesClient {
    private readonly path: string;

    constructor(
        private readonly request: APIRequestContext,
        platformUrl: string,
    ) {
        this.path = `${platformUrl}/accessmanagement/api/v1/enduser/authorizedparties`;
    }

    /**
     * Aktørene brukeren tokenet tilhører, kan representere. Svarer 200 med
     * {@link AuthorizedPartyDtoListPaginatedResult}.
     *
     * GET /accessmanagement/api/v1/enduser/authorizedparties
     */
    GetAuthorizedParties(token: string): Promise<APIResponse> {
        return this.request.get(this.path, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

/** Det testene leser av AuthorizedPartyDto. Underenhetene ligger under hovedenheten. */
export type AuthorizedPartyDto = {
    partyUuid: string;
    name?: string | null;
    organizationNumber?: string | null;
    subunits?: AuthorizedPartyDto[] | null;
};

export type AuthorizedPartyDtoListPaginatedResult = {
    data?: AuthorizedPartyDto[] | null;
    links?: { next?: string | null };
};
