import { check } from "k6";

import { AccessPackage, RegisteredSystemDTO, RegisteredSystemResponse, Right, SystemChangeLog, SystemChangeType, SystemRegisterUpdateResult } from "../../../clients/authentication/types.js";
import { accessPackageUrns, missingRights } from "../common/rights.js";

/**
 * Checks if a system with the specified ID exists in the list of vendor systems.
 *
 * @param {RegisteredSystemDTO[]|null} vendorSystems - The list of vendor systems.
 * @param {string} expectedSystemId - The ID of the system to check for.
 * @returns {boolean} True if the system exists, false otherwise.
 */
function CheckSystemId(vendorSystems, expectedSystemId) {
    const success = check(vendorSystems, {
        "CheckSystemId - System with expected ID exists": (systems) => {
            return systems?.some((system) => system.systemId === expectedSystemId) === true;
        },
    });

    if (!success) {
        if (Array.isArray(vendorSystems)) {
            console.error(`CheckSystemId - expected systemId '${expectedSystemId}' was not found among the ${vendorSystems.length} vendor systems returned`);
            console.error(`CheckSystemId - systemIds returned: ${JSON.stringify(vendorSystems.map((system) => system.systemId))}`);
        } else {
            console.error(`CheckSystemId - expected a list of vendor systems, got: ${JSON.stringify(vendorSystems)}`);
        }
    }

    return success;
}

/**
 * Checks if the system with the specified ID is returned in the vendor get by ID response.
 *
 * @param {RegisteredSystemResponse|null} registeredSystemResponse - The response from the vendor get by ID call.
 * @param {string} expectedSystemId - The ID of the system to check for.
 * @returns {boolean} True if the system is returned, false otherwise.
 */
function CheckSystemIdInVendorGetById(registeredSystemResponse, expectedSystemId) {
    const success = check(registeredSystemResponse, {
        "CheckSystemIdInVendorGetById - System with expected ID is returned": (system) => {
            return system?.id === expectedSystemId;
        },
    });

    if (!success) {
        console.error(`CheckSystemIdInVendorGetById - expected systemId '${expectedSystemId}', got '${registeredSystemResponse?.id}'`);
        console.error(`CheckSystemIdInVendorGetById - system returned: ${JSON.stringify(registeredSystemResponse)}`);
    }

    return success;
}

/**
 * Checks that an update endpoint reported success.
 *
 * @param {SystemRegisterUpdateResult|null} updateResult - The result from an update call.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the update succeeded, false otherwise.
 */
function CheckUpdateSucceeded(updateResult, operation) {
    const success = check(updateResult, {
        [`CheckUpdateSucceeded - ${operation} reports succeeded: true`]: (result) => {
            return result !== null && result.succeeded === true;
        },
    });

    if (!success) {
        console.error(`CheckUpdateSucceeded - ${operation} did not report success, result: ${JSON.stringify(updateResult)}`);
    }

    return success;
}

/**
 * Checks that the localized descriptions on a system match the expected ones.
 *
 * @param {RegisteredSystemResponse|null} registeredSystemResponse - The response from the vendor get by ID call.
 * @param {{[key: string]: string}} expectedDescription - The expected localized descriptions.
 * @returns {boolean} True if all expected descriptions match, false otherwise.
 */
function CheckSystemDescription(registeredSystemResponse, expectedDescription) {
    const success = check(registeredSystemResponse, {
        "CheckSystemDescription - Descriptions match the expected values": (system) => {
            const description = system?.description;

            if (description === null || description === undefined) {
                return false;
            }

            return Object.keys(expectedDescription).every(
                (language) => description[language] === expectedDescription[language],
            );
        },
    });

    if (!success) {
        console.error(`CheckSystemDescription - expected: ${JSON.stringify(expectedDescription)}`);
        console.error(`CheckSystemDescription - got: ${JSON.stringify(registeredSystemResponse?.description)}`);
    }

    return success;
}

/**
 * Checks that the rights on a system contain all the expected rights.
 *
 * @param {RegisteredSystemResponse|null} registeredSystemResponse - The response from the vendor get by ID call.
 * @param {Right[]} expectedRights - The rights the system is expected to have.
 * @returns {boolean} True if all expected rights are present, false otherwise.
 */
function CheckSystemRights(registeredSystemResponse, expectedRights) {
    const actualRights = registeredSystemResponse?.rights ?? [];
    const missing = missingRights(actualRights, expectedRights);

    const success = check(registeredSystemResponse, {
        "CheckSystemRights - System has all expected rights": () => missing.length === 0,
    });

    if (!success) {
        console.error(`CheckSystemRights - missing rights: ${JSON.stringify(missing)}`);
        console.error(`CheckSystemRights - rights returned: ${JSON.stringify(actualRights)}`);
    }

    return success;
}

/**
 * Checks that a list of rights contains all the expected rights.
 *
 * For the `/{systemId}/rights` endpoint, which returns the rights on their own rather
 * than as part of a system.
 *
 * @param {Right[]|null} rights - The rights returned by the API.
 * @param {Right[]} expectedRights - The rights expected.
 * @returns {boolean} True if all expected rights are present, false otherwise.
 */
function CheckRights(rights, expectedRights) {
    const missing = missingRights(rights, expectedRights);

    const success = check(rights, {
        "CheckRights - All expected rights are returned": () => missing.length === 0,
    });

    if (!success) {
        console.error(`CheckRights - missing rights: ${JSON.stringify(missing)}`);
        console.error(`CheckRights - rights returned: ${JSON.stringify(rights)}`);
    }

    return success;
}

/**
 * Checks that the access packages on a system are exactly the expected ones.
 *
 * @param {RegisteredSystemResponse|null} registeredSystemResponse - The response from the vendor get by ID call.
 * @param {AccessPackage[]} expectedAccessPackages - The access packages the system is expected to have.
 * @returns {boolean} True if the access packages match, false otherwise.
 */
function CheckSystemAccessPackages(registeredSystemResponse, expectedAccessPackages) {
    const expectedUrns = accessPackageUrns(expectedAccessPackages);
    const actualUrns = accessPackageUrns(registeredSystemResponse?.accessPackages);

    const success = check(registeredSystemResponse, {
        "CheckSystemAccessPackages - System has the expected access packages": () =>
            expectedUrns.length === actualUrns.length &&
            expectedUrns.every((urn, index) => urn === actualUrns[index]),
    });

    if (!success) {
        console.error(`CheckSystemAccessPackages - expected urns: ${JSON.stringify(expectedUrns)}`);
        console.error(`CheckSystemAccessPackages - got urns: ${JSON.stringify(actualUrns)}`);
    }

    return success;
}

/**
 * Checks that a list of access packages is exactly the expected one.
 *
 * For the `/{systemId}/accesspackages` endpoint, which returns the access packages on
 * their own rather than as part of a system.
 *
 * @param {AccessPackage[]|null} accessPackages - The access packages returned by the API.
 * @param {AccessPackage[]} expectedAccessPackages - The access packages expected.
 * @returns {boolean} True if the access packages match, false otherwise.
 */
function CheckAccessPackages(accessPackages, expectedAccessPackages) {
    const expectedUrns = accessPackageUrns(expectedAccessPackages);
    const actualUrns = accessPackageUrns(accessPackages);

    const success = check(accessPackages, {
        "CheckAccessPackages - The expected access packages are returned": () =>
            expectedUrns.length === actualUrns.length &&
            expectedUrns.every((urn, index) => urn === actualUrns[index]),
    });

    if (!success) {
        console.error(`CheckAccessPackages - expected urns: ${JSON.stringify(expectedUrns)}`);
        console.error(`CheckAccessPackages - got urns: ${JSON.stringify(actualUrns)}`);
    }

    return success;
}

/**
 * Checks that a system is marked as deleted.
 *
 * @param {RegisteredSystemResponse|null} registeredSystemResponse - The response from the vendor get by ID call.
 * @returns {boolean} True if the system is marked as deleted, false otherwise.
 */
function CheckSystemIsDeleted(registeredSystemResponse) {
    const success = check(registeredSystemResponse, {
        "CheckSystemIsDeleted - System is marked as deleted": (system) => {
            return system !== null && system.isDeleted === true;
        },
    });

    if (!success) {
        console.error(`CheckSystemIsDeleted - expected isDeleted: true, got '${registeredSystemResponse?.isDeleted}'`);
        console.error(`CheckSystemIsDeleted - system returned: ${JSON.stringify(registeredSystemResponse)}`);
    }

    return success;
}

/**
 * Checks that a system is not part of the list of registered systems.
 *
 * @param {RegisteredSystemDTO[]|null} systems - The list of registered systems.
 * @param {string} systemId - The ID of the system that should be absent.
 * @returns {boolean} True if the system is absent, false otherwise.
 */
function CheckSystemIdIsAbsent(systems, systemId) {
    const success = check(systems, {
        "CheckSystemIdIsAbsent - System is not part of the list": (registeredSystems) => {
            return Array.isArray(registeredSystems) &&
                !registeredSystems.some((system) => system.systemId === systemId);
        },
    });

    if (!success) {
        if (Array.isArray(systems)) {
            console.error(`CheckSystemIdIsAbsent - systemId '${systemId}' is still present among the ${systems.length} systems returned`);
        } else {
            console.error(`CheckSystemIdIsAbsent - expected a list of systems, got: ${JSON.stringify(systems)}`);
        }
    }

    return success;
}

/**
 * Checks that the change log holds exactly the expected change types, in order.
 *
 * The API returns the log newest first, so it is reversed before comparing. Pass the
 * expected changes chronologically, in the order the test made them.
 *
 * @param {SystemChangeLog[]|null} changeLog - The change log for a system, newest first.
 * @param {SystemChangeType[]} expectedChangeTypes - The change types expected, oldest first.
 * @returns {boolean} True if the log matches, false otherwise.
 */
function CheckSystemChangeLog(changeLog, expectedChangeTypes) {

    // Revsering to reflect when update was made (most recent is first in the list)
    const actualChangeTypes = Array.isArray(changeLog)
        ? changeLog.map((entry) => entry.changeType).reverse()
        : [];

    const success = check(changeLog, {
        "CheckSystemChangeLog - Change log holds the expected changes in order": () =>
            actualChangeTypes.length === expectedChangeTypes.length &&
            expectedChangeTypes.every((changeType, index) => changeType === actualChangeTypes[index]),
    });

    if (!success) {
        console.error(`CheckSystemChangeLog - expected, oldest first: ${JSON.stringify(expectedChangeTypes)}`);
        console.error(`CheckSystemChangeLog - got, oldest first: ${JSON.stringify(actualChangeTypes)}`);
        console.error(`CheckSystemChangeLog - change log returned: ${JSON.stringify(changeLog)}`);
    }

    return success;
}

/**
 * Checks that the register lists systems a customer can pick from.
 *
 * An empty register is not something a customer can work with, so the check is that
 * the list holds systems and that they carry the identifiers the portal shows.
 *
 * @param {RegisteredSystemDTO[]|null} systems - The registered systems.
 * @returns {boolean} True if the register listed usable systems, false otherwise.
 */
function CheckRegisteredSystemsListed(systems) {
    const listed = Array.isArray(systems) ? systems : [];

    const success = check(systems, {
        "CheckRegisteredSystemsListed - The register lists at least one system": () => listed.length > 0,
        "CheckRegisteredSystemsListed - Every system carries a system id and a vendor": () =>
            listed.length > 0 && listed.every((system) => system?.systemId && system?.systemVendorOrgNumber),
    });

    if (!success) {
        console.error(`CheckRegisteredSystemsListed - the register returned ${listed.length} systems`);
        console.error(`CheckRegisteredSystemsListed - first system: ${JSON.stringify(listed[0])}`);
    }

    return success;
}

export const SystemRegisterDomainChecks = {
    CheckRegisteredSystemsListed,
    CheckSystemId,
    CheckSystemIdInVendorGetById,
    CheckSystemIsDeleted,
    CheckSystemIdIsAbsent,
    CheckSystemChangeLog,
    CheckUpdateSucceeded,
    CheckSystemDescription,
    CheckSystemRights,
    CheckRights,
    CheckSystemAccessPackages,
    CheckAccessPackages,
};
