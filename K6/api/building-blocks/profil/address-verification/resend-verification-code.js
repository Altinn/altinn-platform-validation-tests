import { check } from "k6";

import { AddressVerificationClient } from "../../../../clients/address-verification/index.js";

/**
 * Resets the verification process for the current user and the given address
 * by regenerating and sending a new verification code.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressCodeResendRequest} request
 * Request body. Use {@link AddressCodeResendRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the verification code was successfully regenerated and sent.
 */
export function ResendVerificationCode(
    addressVerificationClient,
    request,
    labels = null,
) {
    const res = addressVerificationClient.ResendVerificationCode(
        request,
        labels,
    );

    let sent = false;

    const succeed = check(res, {
        "ResendVerificationCode - status code is 204": (r) =>
            r.status === 204,
        "ResendVerificationCode - status text is 204 No Content": (r) =>
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
