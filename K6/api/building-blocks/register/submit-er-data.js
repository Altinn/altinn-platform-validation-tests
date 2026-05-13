import { check } from "k6";
import { RegisterApiClient } from "../../../clients/authentication/index.js";

/**
 * Posts a SubmitERDataBasic SOAP envelope to the ER update endpoint and checks
 * that the response indicates successful processing.
 *
 * Load the XML template with open() and pass it directly — credentials are
 * substituted internally:
 *   SubmitErData(registerClient, open("path/to/file.xml"), __ENV.SOAP_ER_USERNAME, __ENV.SOAP_ER_PASSWORD);
 *
 * @param {RegisterApiClient} registerClient
 * @param {string} soapTemplate - SOAP envelope loaded via open(), containing ${soapErUsername} and ${soapErPassword} placeholders
 * @param {string} soapErUsername
 * @param {string} soapErPassword
 * @returns (string | ArrayBuffer | null)
 */
export function SubmitErData(registerClient, soapTemplate, soapErUsername, soapErPassword) {
    const soapBody = soapTemplate
        .replace("${soapErUsername}", soapErUsername)
        .replace("${soapErPassword}", soapErPassword);

    const res = registerClient.SubmitErData(soapBody);

    check(res, {
        "SubmitErData - status code MUST be 200": (r) => r.status === 200,
        "SubmitErData - response contains OK_ER_DATA_PROCESSED": (r) =>
            r.body && r.body.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    return res;
}
