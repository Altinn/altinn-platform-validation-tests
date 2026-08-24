import { check } from "k6";

import { VerifiedAddressResponse } from "../../../../clients/profil/address-verification/address-verification.types.js";
import { AddressVerificationClient } from "../../../../clients/profil/address-verification/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all verified addresses for the current user.
 *
 * @param {AddressVerificationClient} addressVerificationClient Client for the Address Verification API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<VerifiedAddressResponse>} Verified addresses for the current user.
 */
export function GetVerifiedAddresses(
    addressVerificationClient,
    labels = null,
) {
    const res = withRetries(
        () => addressVerificationClient.GetVerifiedAddresses(labels),
        "GetVerifiedAddresses",
    );

    /** @type {Array<VerifiedAddressResponse>} */
    let verifiedAddresses = [];

    const succeed = check(res, {
        "GetVerifiedAddresses - status code is 200": (r) =>
            r.status === 200,
        "GetVerifiedAddresses - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return verifiedAddresses;
    }

    check(res, {
        "GetVerifiedAddresses - body is valid": (r) => {
            try {
                verifiedAddresses = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return verifiedAddresses;
}
