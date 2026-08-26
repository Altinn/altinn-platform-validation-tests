import { check } from "k6";

import { AddressVerificationRequest } from "../../../../clients/profil/address-verification/address-verification.types.js";
import { AddressVerificationClient } from "../../../../clients/profil/address-verification/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Verifies an address for the current user by providing the verification code
 * sent to the address.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressVerificationRequest} request
 * Request body. Use {@link AddressVerificationRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the address was successfully verified.
 */
export function VerifyAddress(
    addressVerificationClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => addressVerificationClient.VerifyAddress(request, labels),
        "VerifyAddress",
    );

    let verified = false;

    const succeed = check(res, {
        "VerifyAddress - status code is 204": (r) =>
            r.status === 204,
        "VerifyAddress - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return verified;
    }

    verified = true;

    return verified;
}
