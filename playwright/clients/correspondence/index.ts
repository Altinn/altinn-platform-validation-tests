import { APIRequestContext, APIResponse } from "@playwright/test";

// Portert fra K6/clients/correspondence/correspondence.js, med bare det testene bruker.
// Klienten henter ikke token selv; den tas imot per kall, så testen bestemmer hvem som kaller.
export class CorrespondenceApiClient {
    private readonly path: string;

    constructor(
        private readonly request: APIRequestContext,
        platformUrl: string,
    ) {
        this.path = `${platformUrl}/correspondence/api/v1/correspondence`;
    }

    /**
     * Sender en melding til mottakerne. Svarer 200 med `correspondences`, én per mottaker.
     *
     * POST /correspondence/api/v1/correspondence
     */
    InitializeCorrespondence(token: string, body: InitializeCorrespondences): Promise<APIResponse> {
        return this.request.post(this.path, {
            headers: { Authorization: `Bearer ${token}` },
            data: body,
        });
    }

    /**
     * Meldingen med statushistorikken, for avsender og mottaker.
     *
     * GET /correspondence/api/v1/correspondence/{correspondenceId}/details
     */
    GetCorrespondenceDetails(token: string, correspondenceId: string): Promise<APIResponse> {
        return this.request.get(`${this.path}/${correspondenceId}/details`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Sletter meldingen for godt. Avsenderen kan bare slette før meldingen er publisert, og
     * mottakeren først når den er bekreftet, hvis den krever det.
     *
     * DELETE /correspondence/api/v1/correspondence/{correspondenceId}/purge
     */
    PurgeCorrespondence(token: string, correspondenceId: string): Promise<APIResponse> {
        return this.request.delete(`${this.path}/${correspondenceId}/purge`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

/** Det testene sender av InitializeCorrespondencesExt i Correspondence-API-et. */
export type InitializeCorrespondences = {
    correspondence: {
        resourceId: string;
        sendersReference: string;
        content: {
            language: string;
            messageTitle: string;
            messageSummary: string;
            messageBody: string;
            attachments: [];
        };
        isConfirmationNeeded: boolean;
        // Påkrevd når isConfirmationNeeded er satt.
        dueDateTime?: string;
        // Syntetiske testbrukere kan være reservert i KRR, og da avvises meldingen ellers.
        ignoreReservation: boolean;
    };
    // Fødselsnummer eller organisasjonsnummer.
    recipients: string[];
};

export type InitializedCorrespondences = {
    correspondences: { correspondenceId: string; status: string; recipient: string }[];
};

export type CorrespondenceDetails = {
    status: string;
    statusHistory: { status: string; statusChanged: string }[];
};
