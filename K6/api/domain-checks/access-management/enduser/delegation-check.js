import { check } from "k6";

import { sameSet } from "../../../../helpers.js";

/**
 * @typedef {import("../../../../clients/access-management/enduser/connections/connections.types.js").AccessPackageDtoCheck} AccessPackageDtoCheck
 */

/**
 * Access packages that only a person can hold. They are never offered for an
 * organization.
 */
const PERSON_ONLY_PACKAGE_PREFIXES = [
    "urn:altinn:accesspackage:innbygger-",
    "urn:altinn:accesspackage:vergemal-",
];

/**
 * Finds the delegation check result for an access package.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @returns {AccessPackageDtoCheck|undefined} The result, or undefined if the package is not returned.
 */
function FindPackage(checks, packageUrn) {
    return checks.find((packageCheck) => packageCheck.package?.urn === packageUrn);
}

/**
 * Checks that the delegation check returns at least one access package.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @returns {boolean} True if at least one access package is returned, false otherwise.
 */
function CheckPackagesAreReturned(checks) {
    const success = check(checks, {
        "CheckPackagesAreReturned - Delegation check returns access packages": (returnedChecks) => returnedChecks.length > 0,
    });

    if (!success) {
        console.error("CheckPackagesAreReturned - the delegation check returned no access packages");
    }

    return success;
}

/**
 * Checks that no access package that only a person can hold (innbygger and
 * vergemål) is returned when the party is an organization.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @returns {boolean} True if no such package is returned, false otherwise.
 */
function CheckNoPersonOnlyPackages(checks) {
    const offending = checks
        .map((packageCheck) => packageCheck.package?.urn ?? "")
        .filter((urn) => PERSON_ONLY_PACKAGE_PREFIXES.some((prefix) => urn.startsWith(prefix)));

    const success = check(offending, {
        "CheckNoPersonOnlyPackages - No innbygger or vergemål packages are returned for an organization": () => offending.length === 0,
    });

    if (!success) {
        console.error(`CheckNoPersonOnlyPackages - returned for an organization: ${JSON.stringify(offending)}`);
    }

    return success;
}

/**
 * Checks that the access package is returned and that the user can delegate it.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @returns {boolean} True if the package is returned with result true, false otherwise.
 */
function CheckPackageCanBeDelegated(checks, packageUrn) {
    const packageCheck = FindPackage(checks, packageUrn);

    const success = check(packageCheck, {
        "CheckPackageCanBeDelegated - Access package can be delegated": (returned) => returned?.result === true,
    });

    if (!success) {
        console.error(`CheckPackageCanBeDelegated - expected '${packageUrn}' to be delegable, got: ${JSON.stringify(packageCheck ?? "not returned")}`);
    }

    return success;
}

/**
 * Checks that the access package is returned and that the user cannot delegate it.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @returns {boolean} True if the package is returned with result false, false otherwise.
 */
function CheckPackageCannotBeDelegated(checks, packageUrn) {
    const packageCheck = FindPackage(checks, packageUrn);

    const success = check(packageCheck, {
        "CheckPackageCannotBeDelegated - Access package cannot be delegated": (returned) => returned?.result === false,
    });

    if (!success) {
        console.error(`CheckPackageCannotBeDelegated - expected '${packageUrn}' not to be delegable, got: ${JSON.stringify(packageCheck ?? "not returned")}`);
    }

    return success;
}

/**
 * Checks that the delegation check returns exactly the access packages that
 * were filtered on, and nothing else.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {Array<string>} expectedPackageUrns - The URNs of the access packages filtered on.
 * @returns {boolean} True if exactly those packages are returned, false otherwise.
 */
function CheckOnlyFilteredPackagesAreReturned(checks, expectedPackageUrns) {
    const returnedPackageUrns = checks.map((packageCheck) => packageCheck.package?.urn ?? "");

    const success = check(returnedPackageUrns, {
        "CheckOnlyFilteredPackagesAreReturned - Delegation check returns exactly the packages filtered on": () =>
            sameSet(returnedPackageUrns, expectedPackageUrns),
    });

    if (!success) {
        console.error(`CheckOnlyFilteredPackagesAreReturned - expected: ${JSON.stringify(expectedPackageUrns)}`);
        console.error(`CheckOnlyFilteredPackagesAreReturned - got: ${JSON.stringify(returnedPackageUrns)}`);
    }

    return success;
}

/**
 * Checks that the user can delegate the access package because a role they
 * have on the party gives it (reason Direct-RolePackage).
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @returns {boolean} True if the package can be delegated through the role, false otherwise.
 */
function CheckPackageCanBeDelegatedThroughRole(checks, packageUrn) {
    const packageCheck = FindPackage(checks, packageUrn);

    const success = check(packageCheck, {
        "CheckPackageCanBeDelegatedThroughRole - Access package can be delegated through the user's role on the party": (returned) =>
            returned?.result === true &&
            (returned.reasons ?? []).some((reason) => reason.description === "Direct-RolePackage"),
    });

    if (!success) {
        console.error(`CheckPackageCanBeDelegatedThroughRole - expected '${packageUrn}' to be delegable through a role, got: ${JSON.stringify(packageCheck ?? "not returned")}`);
    }

    return success;
}

export const DelegationCheckDomainChecks = {
    CheckPackagesAreReturned,
    CheckNoPersonOnlyPackages,
    CheckPackageCanBeDelegated,
    CheckPackageCannotBeDelegated,
    CheckOnlyFilteredPackagesAreReturned,
    CheckPackageCanBeDelegatedThroughRole,
};
