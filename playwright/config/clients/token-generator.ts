import { requireEnv } from "../environment";

/**
 * Samme testverktøy som k6-testene bruker, se K6/token-generator.js. Utsteder
 * korte tokens for syntetiske testbrukere, mot delt brukernavn/passord i
 * TOKEN_GENERATOR_USERNAME/TOKEN_GENERATOR_PASSWORD (se example_env/).
 */
const TOKEN_GENERATOR_BASE_URL = "https://altinn-testtools-token-generator.azurewebsites.net/api";

type PersonalTokenOptions = {
    env: string;
    scopes?: string;
    pid?: string;
    userId?: string | number;
    partyId?: string | number;
    partyuuid?: string;
    ttl?: number;
};

type EnterpriseTokenOptions = {
    env: string;
    scopes?: string;
    org?: string;
    orgNo?: string;
    ttl?: number;
};

async function fetchToken(endpoint: string, options: Record<string, string | number | undefined>): Promise<string> {
    const username = requireEnv("TOKEN_GENERATOR_USERNAME");
    const password = requireEnv("TOKEN_GENERATOR_PASSWORD");

    const url = new URL(endpoint);
    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) {
            url.searchParams.append(key, String(value));
        }
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Klarte ikke å hente token fra ${url}: ${response.status} ${await response.text()}`);
    }

    return response.text();
}

export function getPersonalToken(options: PersonalTokenOptions): Promise<string> {
    return fetchToken(`${TOKEN_GENERATOR_BASE_URL}/GetPersonalToken`, { ttl: 3600, ...options });
}

export function getEnterpriseToken(options: EnterpriseTokenOptions): Promise<string> {
    return fetchToken(`${TOKEN_GENERATOR_BASE_URL}/GetEnterpriseToken`, { ttl: 3600, ...options });
}
