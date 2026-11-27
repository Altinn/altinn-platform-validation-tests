import { check } from "k6";

import { sameSet } from "../../../../helpers.js";

/**
 * @typedef {import("../../../../clients/access-management/enduser/connections/connections.types.js").AccessPackageDtoCheck} AccessPackageDtoCheck
 */

/**
 * Access packages a private person can delegate on their own behalf.
 */
const INNBYGGER_PACKAGE_PREFIX = "urn:altinn:accesspackage:innbygger-";

/**
 * Guardianship access packages. The guardianship authority manages them, so
 * they can never be delegated.
 */
const VERGEMAL_PACKAGE_PREFIX = "urn:altinn:accesspackage:vergemal-";

/**
 * Access packages that only a person can hold. They are never offered for an
 * organization, and they are the only ones offered for a private person.
 */
const PERSON_ONLY_PACKAGE_PREFIXES = [
    INNBYGGER_PACKAGE_PREFIX,
    VERGEMAL_PACKAGE_PREFIX,
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
 * Checks that only access packages a person can hold (innbygger and vergemål)
 * are returned when the party is a private person.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @returns {boolean} True if no other packages are returned, false otherwise.
 */
function CheckOnlyPersonPackagesAreReturned(checks) {
    const offending = checks
        .map((packageCheck) => packageCheck.package?.urn ?? "")
        .filter((urn) => !PERSON_ONLY_PACKAGE_PREFIXES.some((prefix) => urn.startsWith(prefix)));

    const success = check(offending, {
        "CheckOnlyPersonPackagesAreReturned - Only innbygger and vergemål packages are returned for a private person": () => offending.length === 0,
    });

    if (!success) {
        console.error(`CheckOnlyPersonPackagesAreReturned - returned for a private person: ${JSON.stringify(offending)}`);
    }

    return success;
}

/**
 * Checks that innbygger packages are returned and that the user can delegate
 * all of them.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @returns {boolean} True if at least one innbygger package is returned and all have result true, false otherwise.
 */
function CheckInnbyggerPackagesCanBeDelegated(checks) {
    const innbygger = checks.filter((packageCheck) => (packageCheck.package?.urn ?? "").startsWith(INNBYGGER_PACKAGE_PREFIX));
    const notDelegable = innbygger.filter((packageCheck) => packageCheck.result !== true).map((packageCheck) => packageCheck.package?.urn);

    const success = check(innbygger, {
        "CheckInnbyggerPackagesCanBeDelegated - All innbygger packages can be delegated": () => innbygger.length > 0 && notDelegable.length === 0,
    });

    if (!success) {
        console.error(`CheckInnbyggerPackagesCanBeDelegated - ${innbygger.length} innbygger packages, not delegable: ${JSON.stringify(notDelegable)}`);
    }

    return success;
}

/**
 * Checks that the user can delegate none of the vergemål packages returned.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @returns {boolean} True if every vergemål package has result false, false otherwise.
 */
function CheckVergemalPackagesCannotBeDelegated(checks) {
    const delegable = checks
        .filter((packageCheck) => (packageCheck.package?.urn ?? "").startsWith(VERGEMAL_PACKAGE_PREFIX) && packageCheck.result !== false)
        .map((packageCheck) => packageCheck.package?.urn);

    const success = check(delegable, {
        "CheckVergemalPackagesCannotBeDelegated - No vergemål package can be delegated": () => delegable.length === 0,
    });

    if (!success) {
        console.error(`CheckVergemalPackagesCannotBeDelegated - delegable: ${JSON.stringify(delegable)}`);
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

/**
 * Checks that the access package is returned with the role among its reasons,
 * so the user's role on the party gives the package.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @param {string} roleUrn - The URN of the role, for example urn:altinn:external-role:ccr:bestyrende-reder.
 * @returns {boolean} True if one of the package's reasons is the role, false otherwise.
 */
function CheckPackageIsGivenByRole(checks, packageUrn, roleUrn) {
    const packageCheck = FindPackage(checks, packageUrn);

    const success = check(packageCheck, {
        "CheckPackageIsGivenByRole - Access package is given by the user's role on the party": (returned) =>
            (returned?.reasons ?? []).some((reason) => reason.roleUrn === roleUrn),
    });

    if (!success) {
        console.error(`CheckPackageIsGivenByRole - expected '${packageUrn}' to be given by '${roleUrn}', got: ${JSON.stringify(packageCheck ?? "not returned")}`);
    }

    return success;
}

/**
 * Checks that the access package is returned without the role among its
 * reasons, so the role does not give the package, whatever the user's other
 * roles give.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results returned by the API.
 * @param {string} packageUrn - The URN of the access package.
 * @param {string} roleUrn - The URN of the role, for example urn:altinn:external-role:ccr:bestyrende-reder.
 * @returns {boolean} True if the package is returned and none of its reasons is the role, false otherwise.
 */
function CheckPackageIsNotGivenByRole(checks, packageUrn, roleUrn) {
    const packageCheck = FindPackage(checks, packageUrn);

    const success = check(packageCheck, {
        "CheckPackageIsNotGivenByRole - Access package is not given by the role": (returned) =>
            returned !== undefined && !(returned.reasons ?? []).some((reason) => reason.roleUrn === roleUrn),
    });

    if (!success) {
        console.error(`CheckPackageIsNotGivenByRole - expected '${packageUrn}' not to be given by '${roleUrn}', got: ${JSON.stringify(packageCheck ?? "not returned")}`);
    }

    return success;
}

/**
 * Checks that the delegation check lists the same access packages as it does
 * for the user's own organization, whatever the result for each.
 *
 * @param {AccessPackageDtoCheck[]} checks - The delegation check results for the party.
 * @param {AccessPackageDtoCheck[]} ownOrganizationChecks - The delegation check results for the user's own organization.
 * @returns {boolean} True if both list the same packages, false otherwise.
 */
function CheckSamePackagesAsOwnOrganization(checks, ownOrganizationChecks) {
    const packageUrns = checks.map((packageCheck) => packageCheck.package?.urn ?? "");
    const ownOrganizationPackageUrns = ownOrganizationChecks.map((packageCheck) => packageCheck.package?.urn ?? "");

    const success = check(packageUrns, {
        "CheckSamePackagesAsOwnOrganization - Delegation check lists the same access packages as for the user's own organization": () =>
            sameSet(packageUrns, ownOrganizationPackageUrns),
    });

    if (!success) {
        const missing = ownOrganizationPackageUrns.filter((urn) => !packageUrns.includes(urn));
        const extra = packageUrns.filter((urn) => !ownOrganizationPackageUrns.includes(urn));
        console.error(`CheckSamePackagesAsOwnOrganization - ${packageUrns.length} packages, ${ownOrganizationPackageUrns.length} for the own organization`);
        console.error(`CheckSamePackagesAsOwnOrganization - missing: ${JSON.stringify(missing)}, extra: ${JSON.stringify(extra)}`);
    }

    return success;
}

export const DelegationCheckDomainChecks = {
    CheckPackagesAreReturned,
    CheckNoPersonOnlyPackages,
    CheckOnlyPersonPackagesAreReturned,
    CheckInnbyggerPackagesCanBeDelegated,
    CheckVergemalPackagesCannotBeDelegated,
    CheckPackageCanBeDelegated,
    CheckPackageCannotBeDelegated,
    CheckOnlyFilteredPackagesAreReturned,
    CheckPackageCanBeDelegatedThroughRole,
    CheckPackageIsGivenByRole,
    CheckPackageIsNotGivenByRole,
    CheckSamePackagesAsOwnOrganization,
};
