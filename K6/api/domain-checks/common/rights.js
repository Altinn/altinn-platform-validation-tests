import { AccessPackage, AttributePair, Right } from "../../../clients/authentication/types.js";

/**
 * Compares two lists of rights on action and resource values, since the API may
 * return additional or reordered fields.
 *
 * @param {Right[]|null} rights - The rights returned by the API.
 * @param {Right[]} expectedRights - The rights expected.
 * @returns {Right[]} The expected rights that are missing from the returned ones.
 */
export function missingRights(rights, expectedRights) {
    const rightKey = (/** @type {Right} */ right) => {
        const resources = (right.resource ?? [])
            .map((/** @type {AttributePair} */ resource) => `${resource.id}:${resource.value}`)
            .sort();

        return `${right.action ?? ""}|${resources.join(",")}`;
    };

    const actualKeys = (rights ?? []).map(rightKey);

    return expectedRights.filter((right) => !actualKeys.includes(rightKey(right)));
}

/**
 * Returns the sorted urns of a list of access packages.
 *
 * @param {AccessPackage[]|null|undefined} accessPackages - The access packages to read urns from.
 * @returns {string[]} The urns, sorted.
 */
export function accessPackageUrns(accessPackages) {
    return (accessPackages ?? [])
        .map((accessPackage) => accessPackage.urn)
        .filter((urn) => urn !== null && urn !== undefined)
        .sort();
}
