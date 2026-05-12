import { check } from "k6";
import { RegisterApiClient } from "../../../clients/authentication/index.js";

/**
 * Posts a pre-built SubmitERDataBasic SOAP envelope to the ER update endpoint
 * and checks that the response indicates successful processing.
 *
 * The caller loads the XML file and substitutes credentials before calling this:
 *   const soapBody = open("path/to/prep-file.xml")
 *       .replace("${soapErUsername}", __ENV.SOAP_ER_USERNAME)
 *       .replace("${soapErPassword}", __ENV.SOAP_ER_PASSWORD);
 *
 * @param {RegisterApiClient} registerClient
 * @param {string} soapBody - Complete SOAP envelope with credentials substituted
 * @returns (string | ArrayBuffer | null)
 */
export function SubmitErData(registerClient, soapBody) {
    const res = registerClient.SubmitErData(soapBody);

    check(res, {
        "SubmitErData - status code MUST be 200": (r) => r.status === 200,
        "SubmitErData - response contains OK_ER_DATA_PROCESSED": (r) =>
            r.body && r.body.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    return res;
}
