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

export const SystemRegisterScope = {
    WRITE: "altinn:authentication/systemregister.write",
    ADMIN: "altinn:authentication/systemregister.admin"
};

export const SystemUserScope = {
    REQUEST: {
        WRITE: "altinn:authentication/systemuser.request.write",
        READ: "altinn:authentication/systemuser.request.read"
    }
};

export const AccessManagementEnduserRequestsScope = {
    WRITE: "altinn:accessmanagement/enduser:requests.write",
};

export const AccessManagementAuthorizedPartiesScope = {
    RESOURCE_OWNER: "altinn:accessmanagement/authorizedparties.resourceowner",
    ADMIN: "altinn:accessmanagement/authorizedparties.admin",
};

export const MaskinportenDelegationsScope = {
    ADMIN: "altinn:maskinporten/delegations.admin"
};

/**
 * Maskinporten scope used to look up a consent before a token is issued (org token):
 * - LookupConsent requires MaskinportenConsentScope.LOOKUP
 */
export const MaskinportenConsentScope = {
    LOOKUP: "altinn:maskinporten/consent.read",
};

// Personal (end user) scope used by the consenter to approve consents.
export const PORTAL_ENDUSER_SCOPE = "altinn:portal/enduser";

export const PDP_AUTHORIZE_ENDUSER_SCOPE = "altinn:pdp/authorize.enduser";

/**
 * Creates an OAuth scope string from an array of scopes.
 *
 * Empty, null, or undefined values are ignored.
 *
 * @param {(string | null | undefined)[]} scopes - The scopes to include.
 * @returns {string} A space-delimited scope string suitable for OAuth requests.
 * @example
 * const scopes = CreateScopeString([
 *   AccessManagementEnduserRequestsScope.WRITE,
 *   ConsentScope.READ,
 *   ConsentScope.WRITE,
 * ]);
 *
 * // Returns:
 * // "altinn:accessmanagement/enduser:requests.write altinn:consentrequests.read altinn:consentrequests.write"
 */
function CreateScopeString(scopes) {
    return scopes.filter(Boolean).join(" ");
}
export const AUTHORIZE_SCOPE = "altinn:authorization/authorize";

export const AuthorizationAuthorizeScope = {
    ADMIN: "altinn:authorization/authorize.admin"
};

export const ServiceOwnerNotificationsScope = {
    CREATE: "altinn:serviceowner/notifications.create"
};

export const SystemScopes = {
    NOTIFICATIONS: {
        CONDITION: {
            CHECK: "altinn:system/notifications.condition.check"
        }
    }
};

export const DigDirScopes = {
    DIALOGPORTEN: {
        NOCONSENT: "digdir:dialogporten.noconsent"
    }
};

export const AltinnScopes = {
    INSTANCES: {
        READ: "altinn:instances.read"
    },
    REGISTER: {
        PARTYLOOKUP: {
            ADMIN: "altinn:register/partylookup.admin"
        }
    }
};
