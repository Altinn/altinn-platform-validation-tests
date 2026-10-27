import { APIRequestContext, APIResponse } from "@playwright/test";

// Same as withRetries in K6/api/building-blocks/common/retry.js: these statuses mean the API
// never answered the request, so no test expects them.
const TRANSIENT_STATUSES = [
    408, // Request Timeout
    429, // Too Many Requests
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
];

// Network errors that throw in Playwright, where K6 gives status 0. Anything else, such as an
// invalid URL or a closed context, is not transient and is thrown right away.
const NETWORK_ERRORS = /ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EPIPE|socket hang up/;

const RETRIES = 3;
const DELAY_MS = 1_000;
const MAX_DELAY_MS = 8_000;

const METHODS = ["get", "post", "put", "patch", "delete", "head", "fetch"] as const;

/**
 * Sends the request again as long as it fails transiently, pausing 1, 2 and 4 seconds.
 * Known network errors are retried too.
 * The last response is returned, and a throw after the last attempt is let through.
 */
async function withRetry(description: string, send: () => Promise<APIResponse>): Promise<APIResponse> {
    for (let attempt = 0; ; attempt++) {
        let reason: string;
        try {
            const response = await send();
            if (!TRANSIENT_STATUSES.includes(response.status()) || attempt === RETRIES) {
                return response;
            }
            reason = `status ${response.status()}`;
        } catch (error) {
            if (attempt === RETRIES || !NETWORK_ERRORS.test(String(error))) {
                throw error;
            }
            reason = String(error).split("\n")[0];
        }

        const delay = Math.min(DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
        console.warn(`${description} - transient error (${reason}). Retrying in ${delay / 1000}s (${attempt + 1} of ${RETRIES}).`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}

/** `request` with every call going through {@link withRetry}. */
export function withRetries(request: APIRequestContext): APIRequestContext {
    return new Proxy(request, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== "function" || !(METHODS as readonly (string | symbol)[]).includes(prop)) {
                return value;
            }
            return (url: string, ...args: unknown[]) =>
                withRetry(`${String(prop).toUpperCase()} ${url}`, () => value.call(target, url, ...args));
        },
    });
}
