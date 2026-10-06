import { APIRequestContext, APIResponse } from "@playwright/test";

import { VersionMatch } from "./types";

// Headerne som er satt; Playwright sender ellers "undefined" som verdi.
function versionMatchHeaders(versionMatch?: VersionMatch): Record<string, string> {
    const headers: Record<string, string> = {};
    if (versionMatch?.ifInstanceVersionMatch) {
        headers["If-Instance-Version-Match"] = versionMatch.ifInstanceVersionMatch;
    }
    if (versionMatch?.ifProcessStateVersionMatch) {
        headers["If-Process-State-Version-Match"] = versionMatch.ifProcessStateVersionMatch;
    }
    return headers;
}

// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class InstancesClient {
    private readonly FULL_PATH: string;

    constructor(
        private readonly request: APIRequestContext,
        baseUrl: string,
    ) {
        this.FULL_PATH = `${baseUrl}/storage/api/v1`;
    }

    /**
     * Sletter en instans. Svarer 200 med instansen, eller 204 når den er hard-slettet.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}
     */
    DeleteInstance(
        token: string,
        instanceOwnerPartyId: string | number,
        instanceGuid: string,
        hard?: boolean,
        versionMatch?: VersionMatch,
    ): Promise<APIResponse> {
        return this.request.delete(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...versionMatchHeaders(versionMatch),
                },
                params: hard === undefined ? undefined : { hard },
            },
        );
    }
}
