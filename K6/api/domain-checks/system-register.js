// Create check for systemId based on RegisteredSystemDTO[] 
import { check } from "k6";

import { RegisteredSystemDTO, RegisteredSystemResponse } from "../../clients/authentication/v2/types.js";

/**
 * Checks if a system with the specified ID exists in the list of vendor systems.
 *
 * @param {RegisteredSystemDTO[]} vendorSystems - The list of vendor systems.
 * @param {string} expectedSystemId - The ID of the system to check for.
 * @returns {boolean} True if the system exists, false otherwise.
 */
function CheckSystemId(vendorSystems, expectedSystemId) {
    // Add k6 check to verify that the system with the expected ID exists in the list of vendor systems
    const success = check(vendorSystems, {
        "CheckSystemId - System with expected ID exists": (systems) => {
            return systems.some((system) => system.systemId === expectedSystemId);
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

// add new check for systemId in VendorGetById, add proper JSDOC for the function

/**
 * Checks if the system with the specified ID is returned in the vendor get by ID response.
 *
 * @param {RegisteredSystemResponse} registeredSystemResponse - The response from the vendor get by ID call.
 * @param {string} expectedSystemId - The ID of the system to check for.
 * @returns {boolean} True if the system is returned, false otherwise.
 */
function CheckSystemIdInVendorGetById(registeredSystemResponse, expectedSystemId) {
    const success = check(registeredSystemResponse, {
        "CheckSystemIdInVendorGetById - System with expected ID is returned": (system) => {
            return system.id === expectedSystemId;
        },
    });

    if (!success) {
        console.error(`CheckSystemIdInVendorGetById - expected systemId '${expectedSystemId}', got '${registeredSystemResponse?.id}'`);
        console.error(`CheckSystemIdInVendorGetById - system returned: ${JSON.stringify(registeredSystemResponse)}`);
    }

    return success;
}

export const SystemRegisterDomainChecks = {
    CheckSystemId, CheckSystemIdInVendorGetById
};
