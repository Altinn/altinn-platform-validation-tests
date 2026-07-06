/**
 * Shared scope definitions used when generating tokens for the tests.
 */

/**
 * Scopes for the enterprise consent request endpoints. These are ENTERPRISE /
 * ORGANIZATION scopes — they must be requested with an enterprise (org) token,
 * NOT a personal/end-user token.
 * - RequestConsent          requires ConsentScope.WRITE
 * - GetConsentRequestEvents requires ConsentScope.READ
 */
export const ConsentScope = {
    READ: "altinn:consentrequests.read",
    WRITE: "altinn:consentrequests.write",
};

/**
 * Maskinporten scope used to look up a consent before a token is issued (org token):
 * - LookupConsent requires MaskinportenConsentScope.LOOKUP
 */
export const MaskinportenConsentScope = {
    LOOKUP: "altinn:maskinporten/consent.read",
};

// Personal (end user) scope used by the consenter to approve consents.
export const ENDUSER_SCOPE = "altinn:portal/enduser";
