import { check } from "k6";
import { RegisterApiClient } from "../../../clients/authentication/index.js";

/**
 * Posts a SubmitERDataBasic SOAP envelope to the ER update endpoint and checks
 * that the response indicates successful processing.
 *
 * Credentials must be interpolated into the SOAP body before calling this function.
 *
 * @param {RegisterApiClient} registerClient
 * @param {string} soapBody - Complete SOAP envelope with credentials already set
 * @returns (string | ArrayBuffer | null)
 */
export function SubmitErData(registerClient, soapBody, label = "SubmitErData") {
    const res = registerClient.SubmitErData(soapBody);

    const ok = check(res, {
        [`${label} - status code MUST be 200`]: (r) => r.status === 200,
        [`${label} - response contains OK_ER_DATA_PROCESSED`]: (r) =>
            r.body && r.body.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    return res;
}
