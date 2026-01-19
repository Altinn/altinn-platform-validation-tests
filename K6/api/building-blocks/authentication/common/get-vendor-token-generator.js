import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

/**
 * Create an enterprise token generator for vendor/system-owner authenticated calls.
 *
 * @param {Object} args
 * @param {string} args.systemOwnerOrgNo
 * @param {string} args.scopes Space-separated scope string
 * @param {number} [args.ttl=3600]
 * @returns {EnterpriseTokenGenerator}
 */
export function getVendorTokenGenerator({ systemOwnerOrgNo, scopes, ttl = 3600 }) {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", ttl);
    options.set("scopes", scopes);
    options.set("orgNo", systemOwnerOrgNo);
    return new EnterpriseTokenGenerator(options);
}

