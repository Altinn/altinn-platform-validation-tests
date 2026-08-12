import { check } from "k6";

/**
 * @typedef {{ id: string, name: string, urn: string, area: { name: string, urn: string }, type: { name: string } }} PackageDto
 */

/**
 * @param {PackageDto[]} packages - Array of packages to search.
 * @param {string} id - The package id to look for.
 * @returns {PackageDto|undefined} - The package with the specified id, or undefined if not found.
 */
function FindPackage(packages, id) {
    return (packages ?? []).find((pkg) => pkg.id === id);
}

/**
 * @param {PackageDto[]} packages - Array of packages to search.
 * @param {string} id - The package id to look for.
 * @returns {boolean} True if a package with the given id exists in the array.
 */
function CheckPackageExists(packages, id) {
    const success = check(packages, {
        "CheckPackageExists - Package with expected id is present": (pkgs) =>
            (pkgs ?? []).some((pkg) => pkg.id === id),
    });

    if (!success) {
        console.error(`CheckPackageExists - no package with id '${id}' found`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected id.
 * @returns {boolean} True if the package has the expected id.
 */
function CheckPackageId(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageId - Package has expected id": (p) => p?.id === expected,
    });

    if (!success) {
        console.error(`CheckPackageId - expected '${expected}', got '${pkg?.id}'`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected name.
 * @returns {boolean} True if the package has the expected name.
 */
function CheckPackageName(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageName - Package has expected name": (p) => p?.name === expected,
    });

    if (!success) {
        console.error(`CheckPackageName - expected '${expected}', got '${pkg?.name}'`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected URN.
 * @returns {boolean} True if the package has the expected URN.
 */
function CheckPackageUrn(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageUrn - Package has expected urn": (p) => p?.urn === expected,
    });

    if (!success) {
        console.error(`CheckPackageUrn - expected '${expected}', got '${pkg?.urn}'`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected area name.
 * @returns {boolean} True if the package has the expected area name.
 */
function CheckPackageAreaName(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageAreaName - Package has expected area.name": (p) => p?.area?.name === expected,
    });

    if (!success) {
        console.error(`CheckPackageAreaName - expected '${expected}', got '${pkg?.area?.name}'`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected area URN.
 * @returns {boolean} True if the package has the expected area URN.
 */
function CheckPackageAreaUrn(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageAreaUrn - Package has expected area.urn": (p) => p?.area?.urn === expected,
    });

    if (!success) {
        console.error(`CheckPackageAreaUrn - expected '${expected}', got '${pkg?.area?.urn}'`);
    }

    return success;
}

/**
 * @param {PackageDto} pkg - The package to check.
 * @param {string} expected - Expected type name.
 * @returns {boolean} True if the package has the expected type name.
 */
function CheckPackageTypeName(pkg, expected) {
    const success = check(pkg, {
        "CheckPackageTypeName - Package has expected type.name": (p) => p?.type?.name === expected,
    });

    if (!success) {
        console.error(`CheckPackageTypeName - expected '${expected}', got '${pkg?.type?.name}'`);
    }

    return success;
}

export const PackagesDomainChecks = {
    FindPackage,
    CheckPackageExists,
    CheckPackageId,
    CheckPackageName,
    CheckPackageUrn,
    CheckPackageAreaName,
    CheckPackageAreaUrn,
    CheckPackageTypeName,
};
