import { check } from "k6";

import { ServiceResource } from "../../../clients/resource-registry/types.js";

/**
 * Checks that the list is not empty and that every resource in it carries the two
 * fields the registry keys everything else off: the identifier and the resource
 * type.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the list is non-empty and fully identified, false otherwise.
 */
function CheckResourcesIdentified(resources, operation) {
    const incomplete = (resources ?? []).filter((resource) => !resource?.identifier || !resource?.resourceType);

    const success = check(resources, {
        [`CheckResourcesIdentified - Every resource from ${operation} has an identifier and a resource type`]: (response) =>
            Array.isArray(response) && response.length > 0 && incomplete.length === 0,
    });

    if (!success) {
        console.error(`CheckResourcesIdentified - ${operation} returned ${resources?.length} resource(s), ${incomplete.length} of them incomplete`);
        console.error(`CheckResourcesIdentified - incomplete resources: ${JSON.stringify(incomplete.slice(0, 5).map((resource) => resource?.identifier))}`);
    }

    return success;
}

/**
 * Checks that two operations describe the same set of resources.
 *
 * An unfiltered search is built from the resource list without apps, so the two
 * have to answer with the same identifiers. That ties the two endpoints together
 * instead of checking each of them against nothing, and it catches a search that
 * silently drops or duplicates resources.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the first operation.
 * @param {Array<ServiceResource>|null} otherResources - The resources returned by the second operation.
 * @param {string} operation - Name of the first operation, used in the check name and logs.
 * @param {string} otherOperation - Name of the second operation, used in the check name and logs.
 * @returns {boolean} True if both operations returned the same identifiers, false otherwise.
 */
function CheckSameResources(resources, otherResources, operation, otherOperation) {
    const identifiers = new Set((resources ?? []).map((resource) => resource?.identifier));
    const otherIdentifiers = new Set((otherResources ?? []).map((resource) => resource?.identifier));

    const onlyInFirst = [...identifiers].filter((identifier) => !otherIdentifiers.has(identifier));
    const onlyInSecond = [...otherIdentifiers].filter((identifier) => !identifiers.has(identifier));

    const success = check(resources, {
        [`CheckSameResources - ${operation} and ${otherOperation} describe the same resources`]: () =>
            identifiers.size > 0 && onlyInFirst.length === 0 && onlyInSecond.length === 0,
    });

    if (!success) {
        console.error(`CheckSameResources - ${operation} returned ${identifiers.size} identifier(s), ${otherOperation} returned ${otherIdentifiers.size}`);
        console.error(`CheckSameResources - only in ${operation}: ${JSON.stringify(onlyInFirst.slice(0, 10))}`);
        console.error(`CheckSameResources - only in ${otherOperation}: ${JSON.stringify(onlyInSecond.slice(0, 10))}`);
    }

    return success;
}

/**
 * Checks that every identifier contains the substring that was searched for.
 *
 * The registry matches the identifier filter case-insensitively on a substring,
 * so a hit that does not contain it means the filter was ignored.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} substring - The substring the search asked for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every identifier contains the substring, false otherwise.
 */
function CheckIdentifiersContain(resources, substring, operation) {
    const needle = substring.toLowerCase();
    const foreign = (resources ?? []).filter(
        (resource) => !`${resource?.identifier}`.toLowerCase().includes(needle),
    );

    const success = check(resources, {
        [`CheckIdentifiersContain - Every hit from ${operation} has '${substring}' in its identifier`]: (response) =>
            Array.isArray(response) && response.length > 0 && foreign.length === 0,
    });

    if (!success) {
        console.error(`CheckIdentifiersContain - ${operation} returned ${resources?.length} hit(s), ${foreign.length} without '${substring}' in the identifier`);
        console.error(`CheckIdentifiersContain - unexpected hits: ${JSON.stringify(foreign.slice(0, 5).map((resource) => resource?.identifier))}`);
    }

    return success;
}

/**
 * Checks that every resource is owned by the org code that was searched for.
 *
 * The resource owner filter matches the whole org code and not a substring, so a
 * hit owned by anyone else means the filter was ignored.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} orgCode - The org code the search asked for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every resource is owned by the org code, false otherwise.
 */
function CheckResourcesOwnedBy(resources, orgCode, operation) {
    const foreign = (resources ?? []).filter(
        (resource) => `${resource?.hasCompetentAuthority?.orgcode}`.toLowerCase() !== orgCode.toLowerCase(),
    );

    const success = check(resources, {
        [`CheckResourcesOwnedBy - Every hit from ${operation} is owned by '${orgCode}'`]: (response) =>
            Array.isArray(response) && response.length > 0 && foreign.length === 0,
    });

    if (!success) {
        console.error(`CheckResourcesOwnedBy - ${operation} returned ${resources?.length} hit(s), ${foreign.length} owned by someone else`);
        console.error(`CheckResourcesOwnedBy - other owners: ${JSON.stringify([...new Set(foreign.map((resource) => resource?.hasCompetentAuthority?.orgcode))].slice(0, 10))}`);
    }

    return success;
}

/**
 * Checks that a search found nothing.
 *
 * A filter nothing can match has to answer with an empty list and not with an
 * error, and not with everything either, which is what a filter the registry
 * ignores would give.
 *
 * @param {Array<ServiceResource>|null} resources - The resources returned by the API.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the list is empty, false otherwise.
 */
function CheckNoResources(resources, operation) {
    const success = check(resources, {
        [`CheckNoResources - ${operation} found nothing`]: (response) =>
            Array.isArray(response) && response.length === 0,
    });

    if (!success) {
        console.error(`CheckNoResources - ${operation} returned ${resources?.length} hit(s), expected none`);
    }

    return success;
}

export const ResourceListDomainChecks = {
    CheckResourcesIdentified,
    CheckSameResources,
    CheckIdentifiersContain,
    CheckResourcesOwnedBy,
    CheckNoResources,
};
