import { APIRequestContext } from "@playwright/test";

import { requireEnv } from "../config/environment";

// Samme testverktøy som K6/token-generator.js. Brukernavn og passord er de samme som i
// K6/example_env/, og settes i TOKEN_GENERATOR_USERNAME og TOKEN_GENERATOR_PASSWORD.
const BASE_URL = "https://altinn-testtools-token-generator.azurewebsites.net/api";

export type EnterpriseTokenOptions = {
    // Miljøet tokenet gjelder, for eksempel at23.
    env: string;
    scopes: string;
    org: string;
    orgNo: string;
};

export type PersonalTokenOptions = {
    env: string;
    scopes: string;
    pid: string;
    userId?: string;
    partyId?: string;
    partyuuid?: string;
};

/**
 * Henter tokens fra Altinns token-generator, for kall som ikke kan gjøres med
 * sluttbrukertokenet fra nettleseren.
 */
export class TokenGeneratorClient {
    constructor(private readonly request: APIRequestContext) {}

    /** GET /GetEnterpriseToken */
    GetEnterpriseToken(options: EnterpriseTokenOptions): Promise<string> {
        return this.hent("GetEnterpriseToken", options);
    }

    /** GET /GetPersonalToken */
    GetPersonalToken(options: PersonalTokenOptions): Promise<string> {
        return this.hent("GetPersonalToken", options);
    }

    private async hent(endepunkt: string, options: Record<string, string | undefined>): Promise<string> {
        const brukernavn = requireEnv("TOKEN_GENERATOR_USERNAME");
        const passord = requireEnv("TOKEN_GENERATOR_PASSWORD");

        const response = await this.request.get(`${BASE_URL}/${endepunkt}`, {
            headers: { Authorization: `Basic ${Buffer.from(`${brukernavn}:${passord}`).toString("base64")}` },
            params: { ttl: 3600, ...Object.fromEntries(Object.entries(options).filter(([, verdi]) => verdi !== undefined)) },
        });
        if (!response.ok()) {
            throw new Error(`Token-generatoren svarte ${response.status()} på ${endepunkt}: ${await response.text()}`);
        }
        return response.text();
    }
}
