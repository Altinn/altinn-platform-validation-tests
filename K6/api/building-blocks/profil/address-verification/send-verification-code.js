import { check } from "k6";

import { AddressVerificationClient } from "../../../../clients/address-verification/index.js";

/**
 * Starts the verification process for the current user and the given address
 * by generating and sending a verification code.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressCodeSendRequest} request
 * Request body. Use {@link AddressCodeSendRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the verification code was successfully generated and sent.
 */
export function SendVerificationCode(
    addressVerificationClient,
    request,
    labels = null,
) {
    const res = addressVerificationClient.SendVerificationCode(
        request,
        labels,
    );

    let sent = false;

    const succeed = check(res, {
        "SendVerificationCode - status code is 204": (r) =>
            r.status === 204,
        "SendVerificationCode - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return sent;
    }

    sent = true;

    return sent;
}
