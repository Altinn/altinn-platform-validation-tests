import { AuthorizedPartiesClient } from "../../../../clients/auth/index.js"
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';

let authorizedPartiesClient = undefined;

/**
 * Function to set up and return clients to interact with the Authorized Parties API
 *
 * @returns {Array} An array containing the AuthorizedPartiesClient instance
 */
export function getClients() {
    if (authorizedPartiesClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts)
        authorizedPartiesClient = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [authorizedPartiesClient]
}