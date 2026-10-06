import { APIRequestContext, APIResponse } from "@playwright/test";

// Samme som withRetries i K6/api/building-blocks/common/retry.js: statusene betyr at API-et
// aldri ga noe svar på forespørselen, så ingen test forventer dem.
const TRANSIENTE_STATUSER = [
    408, // Request Timeout
    429, // Too Many Requests
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
];

const RETRIES = 3;
const DELAY_MS = 1_000;
const MAX_DELAY_MS = 8_000;

const METODER = ["get", "post", "put", "patch", "delete", "head", "fetch"] as const;

/**
 * Sender forespørselen på nytt så lenge den feiler transient, med 1, 2 og 4 sekunders
 * pause. Nettverksfeil kaster i Playwright, der K6 gir status 0, så de prøves også på nytt.
 * Det siste svaret returneres, og et kast etter siste forsøk slippes gjennom.
 */
async function medRetry(beskrivelse: string, send: () => Promise<APIResponse>): Promise<APIResponse> {
    for (let forsok = 0; ; forsok++) {
        let arsak: string;
        try {
            const response = await send();
            if (!TRANSIENTE_STATUSER.includes(response.status()) || forsok === RETRIES) {
                return response;
            }
            arsak = `status ${response.status()}`;
        } catch (error) {
            if (forsok === RETRIES) {
                throw error;
            }
            arsak = String(error).split("\n")[0];
        }

        const delay = Math.min(DELAY_MS * 2 ** forsok, MAX_DELAY_MS);
        console.warn(`${beskrivelse} - transient feil (${arsak}). Prøver igjen om ${delay / 1000}s (${forsok + 1} av ${RETRIES}).`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}

/** `request` der alle kall går gjennom {@link medRetry}. */
export function medRetries(request: APIRequestContext): APIRequestContext {
    return new Proxy(request, {
        get(target, prop, receiver) {
            const verdi = Reflect.get(target, prop, receiver);
            if (typeof verdi !== "function" || !(METODER as readonly (string | symbol)[]).includes(prop)) {
                return verdi;
            }
            return (url: string, ...args: unknown[]) =>
                medRetry(`${String(prop).toUpperCase()} ${url}`, () => verdi.call(target, url, ...args));
        },
    });
}
