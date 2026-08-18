import { check } from "k6";

/**
 * The address types the API verifies.
 */
const ADDRESS_TYPES = ["Email", "Sms"];

/**
 * Checks that the verified addresses are a list of typed addresses.
 *
 * A person that has verified nothing has an empty list, which is a valid answer, so
 * the list itself is not required to hold anything. What every entry does have to
 * carry is the address and which of the two kinds it is, since an entry without a
 * type says nothing about whether it may be notified on.
 *
 * @param {Array<VerifiedAddressResponse>} verifiedAddresses - What the read returned.
 * @returns {boolean} True if the list is well formed, false otherwise.
 */
function CheckVerifiedAddressesAreTyped(verifiedAddresses) {
    const success = check(verifiedAddresses, {
        "CheckVerifiedAddressesAreTyped - Answer is a list": (a) => Array.isArray(a),
        "CheckVerifiedAddressesAreTyped - Every address has a value and a known type": (a) =>
            Array.isArray(a) &&
            a.every(
                (address) =>
                    typeof address?.value === "string" &&
                    address.value.length > 0 &&
                    ADDRESS_TYPES.includes(address?.type),
            ),
    });

    if (!success) {
        console.error(
            `CheckVerifiedAddressesAreTyped - addresses returned: ${JSON.stringify(verifiedAddresses)}`,
        );
    }

    return success;
}

export const AddressVerificationDomainChecks = {
    CheckVerifiedAddressesAreTyped,
};
