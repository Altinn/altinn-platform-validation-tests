import { APIRequestContext, APIResponse } from "@playwright/test";

// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class InstancesClient {
    // baseUrl er {org}-delen av stien, for eksempel https://ttd.apps.at23.altinn.cloud/ttd,
    // siden testene bare bruker apper fra ttd.
    constructor(
        private readonly request: APIRequestContext,
        private readonly baseUrl: string,
    ) {}

    /**
     * Sletter en instans. Svarer 200 med instansen.
     *
     * DELETE /{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}
     */
    DeleteInstance(
        token: string,
        app: string,
        instanceOwnerPartyId: string | number,
        instanceGuid: string,
        hard?: boolean,
    ): Promise<APIResponse> {
        return this.request.delete(
            `${this.baseUrl}/${app}/instances/${instanceOwnerPartyId}/${instanceGuid}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: hard === undefined ? undefined : { hard },
            },
        );
    }
}
