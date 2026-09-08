import { check } from "k6";

import { PolicyRightsDTO } from "../../../clients/resource-registry/types.js";

/**
 * @typedef {import("../../../clients/resource-registry/types.js").PolicySubjectDTO} PolicySubjectDTO
 * @typedef {import("../../../clients/resource-registry/types.js").UrnJsonTypeValue} UrnJsonTypeValue
 */

/**
 * The registry flattens a policy into one right per action, so a policy that
 * arrived intact answers with as many rights as it had actions. More rights than
 * that means the policy granted something it was not asked to.
 *
 * @param {Array<PolicyRightsDTO>|null} rights - The rights returned by the API.
 * @param {Array<string>} expectedActions - The actions the policy asked for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if there is one right per action, false otherwise.
 */
function CheckOneRightPerAction(rights, expectedActions, operation) {
    const success = check(rights, {
        [`CheckOneRightPerAction - ${operation} returns one right per action`]: (response) =>
            Array.isArray(response) && response.length === expectedActions.length,
    });

    if (!success) {
        console.error(`CheckOneRightPerAction - ${operation} returned ${rights?.length} right(s), expected ${expectedActions.length}`);
        console.error(`CheckOneRightPerAction - actions asked for: ${JSON.stringify(expectedActions)}`);
    }

    return success;
}

/**
 * Checks that every right is scoped to the resource that was asked about, so a
 * policy written against the wrong resource does not pass unnoticed.
 *
 * @param {Array<PolicyRightsDTO>|null} rights - The rights returned by the API.
 * @param {string} resourceId - The resource the rights were asked for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every right is for the resource, false otherwise.
 */
function CheckRightsForResource(rights, resourceId, operation) {
    const foreign = (rights ?? []).filter((right) => !(right.resource ?? []).some(
        (attribute) => attribute.value === resourceId,
    ));

    const success = check(rights, {
        [`CheckRightsForResource - Every right from ${operation} is for the expected resource`]: (response) =>
            Array.isArray(response) && response.length > 0 && foreign.length === 0,
    });

    if (!success) {
        console.error(`CheckRightsForResource - expected every right to be for resource '${resourceId}'`);
        console.error(`CheckRightsForResource - rights for other resources: ${JSON.stringify(foreign.map((right) => right.resource))}`);
    }

    return success;
}

/**
 * Checks that the rights cover every action the policy asked for.
 *
 * @param {Array<PolicyRightsDTO>|null} rights - The rights returned by the API.
 * @param {Array<string>} expectedActions - The actions the policy asked for.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every action is covered, false otherwise.
 */
function CheckRightsCoverActions(rights, expectedActions, operation) {
    const actions = (rights ?? []).map((right) => right.action?.value);
    const missing = expectedActions.filter((action) => !actions.includes(action));

    const success = check(rights, {
        [`CheckRightsCoverActions - ${operation} covers every action the policy asked for`]: () =>
            missing.length === 0,
    });

    if (!success) {
        console.error(`CheckRightsCoverActions - actions missing from ${operation}: ${JSON.stringify(missing)}`);
        console.error(`CheckRightsCoverActions - actions returned: ${JSON.stringify(actions)}`);
    }

    return success;
}

/**
 * Checks that every right lists the subjects the policy granted it to. Reads the
 * subject attribute values, so it works for role codes and access packages alike.
 *
 * @param {Array<PolicyRightsDTO>|null} rights - The rights returned by the API.
 * @param {Array<string>} expectedSubjects - The subject values the policy granted,
 * for instance role codes.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every right lists every subject, false otherwise.
 */
function CheckRightsGrantSubjects(rights, expectedSubjects, operation) {
    const subjectValues = (/** @type {PolicyRightsDTO} */ right) => (right.subjects ?? []).flatMap(
        (/** @type {PolicySubjectDTO} */ subject) => (subject.subjectAttributes ?? []).map(
            (/** @type {UrnJsonTypeValue} */ attribute) => attribute.value,
        ),
    );

    const incomplete = (rights ?? []).filter((right) => {
        const values = subjectValues(right);

        return !expectedSubjects.every((subject) => values.includes(subject));
    });

    const success = check(rights, {
        [`CheckRightsGrantSubjects - Every right from ${operation} lists the expected subjects`]: (response) =>
            Array.isArray(response) && response.length > 0 && incomplete.length === 0,
    });

    if (!success) {
        console.error(`CheckRightsGrantSubjects - expected every right to list ${JSON.stringify(expectedSubjects)}`);
        console.error(`CheckRightsGrantSubjects - rights missing subjects: ${JSON.stringify(incomplete.map(subjectValues))}`);
    }

    return success;
}

/**
 * Checks that the subjects came back as the kind of subject the policy granted
 * them to. Role codes and access packages both end up as subject values, so
 * without this a policy that granted an access package but landed as a role code
 * would still look correct.
 *
 * @param {Array<PolicyRightsDTO>|null} rights - The rights returned by the API.
 * @param {Array<string>} expectedTypes - The subject attribute types expected,
 * for instance urn:altinn:rolecode and urn:altinn:accesspackage.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every right carries every type, false otherwise.
 */
function CheckRightsSubjectTypes(rights, expectedTypes, operation) {
    const typesOf = (/** @type {PolicyRightsDTO} */ right) => (right.subjects ?? []).flatMap(
        (/** @type {PolicySubjectDTO} */ subject) => (subject.subjectAttributes ?? []).map(
            (/** @type {UrnJsonTypeValue} */ attribute) => attribute.type,
        ),
    );

    const incomplete = (rights ?? []).filter((right) => {
        const types = typesOf(right);

        return !expectedTypes.every((type) => types.includes(type));
    });

    const success = check(rights, {
        [`CheckRightsSubjectTypes - Every right from ${operation} carries the expected subject types`]: (response) =>
            Array.isArray(response) && response.length > 0 && incomplete.length === 0,
    });

    if (!success) {
        console.error(`CheckRightsSubjectTypes - expected every right to carry ${JSON.stringify(expectedTypes)}`);
        console.error(`CheckRightsSubjectTypes - rights missing types: ${JSON.stringify(incomplete.map(typesOf))}`);
    }

    return success;
}

export const PolicyRightsDomainChecks = {
    CheckOneRightPerAction,
    CheckRightsForResource,
    CheckRightsCoverActions,
    CheckRightsGrantSubjects,
    CheckRightsSubjectTypes,
};
