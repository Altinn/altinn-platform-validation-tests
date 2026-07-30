// Create check for systemId based on RegisteredSystemDTO[] 
import { RegisteredSystemDTO, RegisteredSystemResponse } from "../../clients/authentication/v2/types.js";
import { check } from "k6";

/**
 * Checks if a system with the specified ID exists in the list of vendor systems.
 *
 * @param {RegisteredSystemDTO[]} vendorSystems - The list of vendor systems.
 * @param {string} expectedSystemId - The ID of the system to check for.
 * @returns {boolean} True if the system exists, false otherwise.
 */
 function CheckSystemId(vendorSystems, expectedSystemId) {
    // Add k6 check to verify that the system with the expected ID exists in the list of vendor systems
    return check(vendorSystems, {
        "CheckSystemId - System with expected ID exists": (systems) => {
            return systems.some((system) => system.systemId === expectedSystemId);
        },
    });
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
    return check(registeredSystemResponse, {
        "CheckSystemIdInVendorGetById - System with expected ID is returned": (system) => {
            return system.systemId === expectedSystemId;
        },
    });
}

export const SystemRegisterDomainChecks = {
    CheckSystemId, CheckSystemIdInVendorGetById
};