import { check } from "k6";

import { AddressCodeResendRequest } from "../../../../clients/profil/address-verification/address-verification.types.js";
import { AddressVerificationClient } from "../../../../clients/profil/address-verification/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Resets the verification process for the current user and the given address
 * by regenerating and sending a new verification code.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressCodeResendRequest} request
 * Request body. Use {@link AddressCodeResendRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the verification code was successfully regenerated and sent.
 */
export function ResendVerificationCode(
    addressVerificationClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => addressVerificationClient.ResendVerificationCode(
            request,
            labels,
        ),
        "ResendVerificationCode",
    );

    let sent = false;

    const succeed = check(res, {
        "ResendVerificationCode - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return sent;
    }

    sent = true;

    return sent;
}
