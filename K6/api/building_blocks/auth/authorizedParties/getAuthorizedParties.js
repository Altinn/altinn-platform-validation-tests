import { check } from 'k6';
import { AuthorizedPartiesClient } from "../../../../clients/auth/index.js"
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';

/**
 * Get Authorized Parties
 * @param {AuthorizedPartiesClient} authorizedPartiesClient A client to interact with the Authorized Parties API
 * @param {*} type
 * @param {*} value
 * @param {*} label
 */

export function GetAuthorizedParties(authorizedPartiesClient, type, value, includeAltinn2, label = null) {
    const res = authorizedPartiesClient.GetAuthorizedParties(type, value, includeAltinn2, label)

    const succeed = check(res, {
        'GetAuthorizedParties - status code is 200': (r) => r.status === 200,
        'GetAuthorizedParties - status text is 200 OK': (r) => r.status_text == "200 OK",
        'GetAuthorizedParties - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    if (!succeed) {
        console.log(res.status)
        console.log(res.body)
    }
    return res.body;
}

let authorizedPartiesClient = undefined;

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

