import { check } from "k6";
import { PdpAuthorizeClient } from "../../../../clients/auth/index.js";


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
    const res = pdpAuthorizeClient.authorizeEnduser(ssn, resourceId, action, subscriptionKey, label);
    checker(res, "PdpAuthorizeUser", expectedResponse);
    return res.body;
}

/**
 *
 * @param {PdpAuthorizeClient} pdpAuthorizeClient A client to interact with the Pdp Authorize API
 * @param {*} ssn - social security number of the end user
 * @param {*} resourceId - e.g. ttd-dialogporten-performance-test-02
 * @param {*} org - organization number
 * @param {*} action - e.g. read, write, sign
 * @param {*} expectedResponse - e.g. Permit, Deny, NotApplicable
 * @param {*} subscriptionKey - subscription key for the API
 * @param {*} label - label for the request
 */

export function PdpAuthorizeDagl(pdpAuthorizeClient, ssn, org, resourceId, action, expectedResponse, subscriptionKey, label = null) {
    const res = pdpAuthorizeClient.authorizeDagl(ssn, resourceId, org, action, subscriptionKey, label);
    checker(res, "PdpAuthorizeDagl", expectedResponse);
    return res.body;
}

/**
 * Function to check common response properties
 * @param {} res - response object
 * @param {*} method - method name for logging
 */
function checker(res, method, expectedResponse) {
    const succeed = check(res, {
        [`${method} - status code is 200`]: (r) => r.status === 200,
        [`${method} - status text is 200 OK`]: (r) => r.status_text == "200 OK",
        [`${method} - body is not empty and has correct response`]: (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined && res_body.response[0].decision === expectedResponse;;
        }
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    };
}
