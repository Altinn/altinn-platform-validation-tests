import { check } from "k6";

import { AddressVerificationClient } from "../../../../clients/profil/address-verification/index.js";

/**
 * Verifies an address for the current user by providing the verification code
 * sent to the address.
 *
 * A code that was actually received answers 204, and that is what the default
 * accepts. A test that sends a code the address never got wants the refusal
 * instead: 422 for a wrong code, 429 once too many attempts have been made on the
 * address. Pass those in `expectedStatuses` and the check passes on the refusal
 * and fails on the 204 that would mean a wrong code was let through.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {AddressVerificationRequest} request
 * Request body. Use {@link AddressVerificationRequestBuilder}.
 * @param {number[]} [expectedStatuses] Status codes counted as the expected outcome. Defaults to [204].
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the call answered one of the expected statuses.
 */
export function VerifyAddress(
    addressVerificationClient,
    request,
    expectedStatuses = [204],
    labels = null,
) {
    const res = addressVerificationClient.VerifyAddress(request, labels);

    let asExpected = false;

    const succeed = check(res, {
        [`VerifyAddress - status code is ${expectedStatuses.join(" or ")}`]: (r) =>
            expectedStatuses.includes(r.status),
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return asExpected;
    }

    asExpected = true;

    return asExpected;
}
