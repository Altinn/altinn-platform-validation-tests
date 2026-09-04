import { check } from "k6";

import { AddressCodeSendRequest } from "../../../../clients/profil/address-verification/address-verification.types.js";
import { AddressVerificationClient } from "../../../../clients/profil/address-verification/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Starts the verification process for the current user and the given address
 * by generating and sending a verification code.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressCodeSendRequest} request
 * Request body. Use {@link AddressCodeSendRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the verification code was successfully generated and sent.
 */
export function SendVerificationCode(
    addressVerificationClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => addressVerificationClient.SendVerificationCode(
            request,
            labels,
        ),
        "SendVerificationCode",
    );

    let sent = false;

    const succeed = check(res, {
        "SendVerificationCode - status code is 204": (r) =>
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
