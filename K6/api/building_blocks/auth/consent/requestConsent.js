import { check } from 'k6';
import { ConsentApiClient } from "../../../../clients/auth/index.js"

/**
 * Request Consent
 * @param {ConsentApiClient} consentApiClient A client to interact with the Consent API
 * @param {string} id
 * @param {string} from
 * @param {string} to
 * @param {string} validTo
 * @param {Array<{ action: string[], resource: [ {type: string, value: string}], metaData: Object }> } consentRights
 * @param {string} redirectUrl
 * @returns (string | ArrayBuffer | null)
 */
export function RequestConsent(consentApiClient, id, from, to, validTo, consentRights, redirectUrl) {
    const res = consentApiClient.RequestConsent(id, from, to, validTo, consentRights, redirectUrl)
    const succeed = check(res, {
        'RequestConsent - status code is 201': (r) => r.status === 201,
        'RequestConsent - status text is 201 Created': (r) => r.status_text == "201 Created",
        'RequestConsent - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status)
        console.log(res.status_text)
        console.log(res.body)
    }
    return res.body
}
