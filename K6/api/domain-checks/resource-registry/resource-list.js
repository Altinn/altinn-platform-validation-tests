import { check } from "k6";

import { ServiceResource } from "../../../clients/resource-registry/types.js";

// The two resource types the includeApps and includeMigratedApps parameters
// decide whether the list hands out.
const APP_RESOURCE_TYPES = ["AltinnApp", "MigratedApp"];

/**
 * Checks that the list is not empty and that every resource in it carries the two
 * fields the registry keys everything else off: the identifier and the resource
 * type.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if the list is non-empty and fully identified, false otherwise.
 */
function CheckResourcesIdentified(resources, operation) {
    const incomplete = (resources ?? []).filter((resource) => !resource?.identifier || !resource?.resourceType);

    const success = check(resources, {
        "CheckResourcesIdentified - Every resource has an identifier and a resource type": (response) =>
            Array.isArray(response) && response.length > 0 && incomplete.length === 0,
    });

    if (!success) {
        console.error(`CheckResourcesIdentified - ${operation} returned ${resources?.length} resource(s), ${incomplete.length} of them incomplete`);
        console.error(`CheckResourcesIdentified - incomplete resources: ${JSON.stringify(incomplete.slice(0, 5).map((resource) => resource?.identifier))}`);
    }

    return success;
}

/**
 * Checks that the same resource is not listed twice.
 *
 * The list hands out the current version of each resource, so an identifier that
 * turns up more than once means the same resource came back in two versions.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if every identifier is unique, false otherwise.
 */
function CheckResourcesUnique(resources, operation) {
    const identifiers = (resources ?? []).map((resource) => resource?.identifier);
    const seen = new Set();
    const duplicates = [...new Set(identifiers.filter((identifier) => seen.size === seen.add(identifier).size))];

    const success = check(resources, {
        "CheckResourcesUnique - No resource is listed twice": (response) =>
            Array.isArray(response) && response.length > 0 && duplicates.length === 0,
    });

    if (!success) {
        console.error(`CheckResourcesUnique - ${operation} returned ${resources?.length} resource(s) with ${identifiers.length - duplicates.length} unique identifier(s)`);
        console.error(`CheckResourcesUnique - duplicated identifiers: ${JSON.stringify(duplicates.slice(0, 10))}`);
    }

    return success;
}

/**
 * Checks that every resource in the first list is in the second one as well.
 *
 * Leaving the apps out is the only difference between the two answers, so the
 * list without them has to be contained in the list with them. That catches a
 * parameter that drops more than the apps.
 *
 * @param {Array<ServiceResource>|null} resources - The resources expected to be contained.
 * @param {Array<ServiceResource>|null} otherResources - The resources expected to contain them.
 * @param {string} operation - Name of the first operation, used in the logs.
 * @param {string} otherOperation - Name of the second operation, used in the logs.
 * @returns {boolean} True if the first list is contained in the second, false otherwise.
 */
function CheckResourcesContained(resources, otherResources, operation, otherOperation) {
    const otherIdentifiers = new Set((otherResources ?? []).map((resource) => resource?.identifier));
    const missing = (resources ?? [])
        .map((resource) => resource?.identifier)
        .filter((identifier) => !otherIdentifiers.has(identifier));

    const success = check(resources, {
        "CheckResourcesContained - Every resource in the first list is in the second one": (response) =>
            Array.isArray(response) && response.length > 0 && missing.length === 0,
    });

    if (!success) {
        console.error(`CheckResourcesContained - ${operation} returned ${resources?.length} resource(s), ${missing.length} of them missing from ${otherOperation}, which returned ${otherResources?.length}`);
        console.error(`CheckResourcesContained - missing identifiers: ${JSON.stringify(missing.slice(0, 10))}`);
    }

    return success;
}

/**
 * Checks that the resources the second list has on top of the first one are apps,
 * and that there are some.
 *
 * That is what the two app parameters are for, so a difference of nothing says
 * they were ignored, and a difference holding anything but an app says they drop
 * more than they are supposed to.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned without the apps.
 * @param {Array<ServiceResource>|null} otherResources - The resources returned with the apps.
 * @param {string} operation - Name of the first operation, used in the logs.
 * @param {string} otherOperation - Name of the second operation, used in the logs.
 * @returns {boolean} True if the difference is a non-empty set of apps, false otherwise.
 */
function CheckExtraResourcesAreApps(resources, otherResources, operation, otherOperation) {
    const identifiers = new Set((resources ?? []).map((resource) => resource?.identifier));
    const extra = (otherResources ?? []).filter((resource) => !identifiers.has(resource?.identifier));
    const notApps = extra.filter((resource) => !APP_RESOURCE_TYPES.includes(`${resource?.resourceType}`));

    const success = check(otherResources, {
        "CheckExtraResourcesAreApps - The apps are the only thing the two lists differ by": () =>
            extra.length > 0 && notApps.length === 0,
    });

    if (!success) {
        console.error(`CheckExtraResourcesAreApps - ${otherOperation} returned ${extra.length} resource(s) ${operation} did not, ${notApps.length} of them not apps`);
        console.error(`CheckExtraResourcesAreApps - not apps: ${JSON.stringify(notApps.slice(0, 5).map((resource) => `${resource?.identifier} (${resource?.resourceType})`))}`);
    }

    return success;
}

export const ResourceListDomainChecks = {
    CheckResourcesIdentified,
    CheckResourcesUnique,
    CheckResourcesContained,
    CheckExtraResourcesAreApps,
};
