import { check } from 'k6';
import { PdpAuthorizeClient } from '../../../../clients/auth/index.js';


/**
 * 
 * @param {PdpAuthorizeClient} pdpAuthorizeClient A client to interact with the Pdp Authorize API
 * @param {*} ssn - social security number of the end user
 * @param {*} resourceId - e.g. ttd-dialogporten-performance-test-02
 * @param {*} action - e.g. read, write, sign
 * @param {*} expectedResponse - e.g. Permit, Deny, NotApplicable
 * @param {*} subscriptionKey - subscription key for the API
 * @param {*} label - label for the request
 */

export function PdpAuthorizeUser(pdpAuthorizeClient, ssn, resourceId, action, expectedResponse, subscriptionKey, label = null) {
    const res = pdpAuthorizeClient.authorizeEnduser(ssn, resourceId, action, subscriptionKey, label )
    const succeed = check(res, {
        'GetAuthorizedParties - status code is 200': (r) => r.status === 200,
        'GetAuthorizedParties - status text is 200 OK': (r) => r.status_text == "200 OK",
        'GetAuthorizedParties - body is not empty and has correct response': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined && res_body.response[0].decision === expectedResponse;
        }
    });
    if (!succeed) {
        console.log(res.status)
        console.log(res.body)
    }
    return res.body;
}