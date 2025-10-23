import { PdpAuthorizeClient } from "../../../../clients/auth/index.js"
import { PersonalTokenGenerator } from '../../../../commonImports.js';

let pdpAuthorizeClient = undefined;
let tokenGenerator = undefined;

/**
 * Function to set up and return clients to interact with the Pdp Authorize API
 *
 * @returns {Array} An array containing the PdpAuthorizeClient and PersonalTokenGenerator instances
 */
export function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (pdpAuthorizeClient == undefined) {
        pdpAuthorizeClient = new PdpAuthorizeClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [pdpAuthorizeClient, tokenGenerator];
}