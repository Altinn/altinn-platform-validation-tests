import { check } from "k6";

/**
 * Checks for whether Access Management hands out a resource or refuses it.
 *
 * Written for Altinn/altinn-auth#4860, which moves the delegable flag and the
 * access list mode from a call to the resource registry to Access Management's
 * own copy of the resource. Nothing is meant to change for the caller, so these
 * pin down what both answers look like today and keep doing so after the move:
 * a copy that got the flag wrong in either direction shows up as one of them
 * failing.
 */

/**
 * Reason codes the delegation check puts on a right it refuses, as the
 * DelegationCheckReasonCode enum serializes them.
 */
export const DelegationCheckReasonCode = Object.freeze({
    ResourceNotDelegable: "ResourceNotDelegable",
    AccessListValidationFail: "AccessListValidationFail",
});

/**
 * Error codes Access Management answers a refused resource with.
 *
 * ResourceNotDelegable is Problems.ResourceNotDelegable (AM, 42), used by the
 * service owner connections endpoints. ResourceIsNotDelegable is
 * ValidationErrors.ResourceIsNotDelegable (AM, 49), used by both request APIs,
 * where it arrives as one of the validation errors on a 400.
 * FromPartyNotOnAccessList is Problems.FromPartyNotOnAccessList (AM, 53), which
 * the service owner delegation answers once Altinn/altinn-auth#4186 is fixed.
 */
export const ProblemCode = Object.freeze({
    ResourceNotDelegable: "AM-00042",
    ResourceIsNotDelegable: "AM.VLD-00049",
    FromPartyNotOnAccessList: "AM-00053",
});

/**
 * Checks that the delegation check refused every right on the resource, giving
 * the expected reason for each.
 *
 * The check answers 200 either way, so the refusal is in the body: each right
 * comes back with result false and the reason among its reason codes. An empty
 * list of rights would pass "every right" without saying anything, so at least
 * one right is required.
 *
 * @param {import("../../../clients/access-management-bff/common/common.types.js").ResourceCheckDto|null} resourceCheck The delegation check response.
 * @param {string} reasonCode The reason every right has to carry. See DelegationCheckReasonCode.
 * @param {string} operation Name of the operation, used in the logs.
 * @returns {boolean} True if every right was refused for that reason.
 */
function CheckDelegationCheckRefused(resourceCheck, reasonCode, operation) {
    /** @type {Array<*>} */
    const rights = resourceCheck?.rights ?? [];

    const success = check(rights, {
        [`CheckDelegationCheckRefused - the resource has rights to check (${reasonCode})`]: (r) => r.length > 0,
        [`CheckDelegationCheckRefused - no right is delegable (${reasonCode})`]: (r) =>
            r.every((right) => right?.result === false),
        [`CheckDelegationCheckRefused - every right gives the reason (${reasonCode})`]: (r) =>
            r.every((right) => (right?.reasonCodes ?? []).includes(reasonCode)),
    });

    if (!success) {
        console.error(
            `CheckDelegationCheckRefused - ${operation} did not refuse every right with ${reasonCode}: ${JSON.stringify(rights)}`,
        );
    }

    return success;
}

/**
 * Collects every error code in a problem details body: the top-level one, and
 * the codes of the validation errors under it.
 *
 * @param {*} body The parsed body.
 * @returns {Array<string>} The codes.
 */
function problemCodes(body) {
    // ASP.NET's own validation problems carry errors as an object keyed by
    // field rather than a list, so only lists are read.
    const asList = (/** @type {*} */ value) => (Array.isArray(value) ? value : []);
    const nested = [...asList(body?.validationErrors), ...asList(body?.errors)];

    return [body?.code, ...nested.map((error) => error?.code)]
        .filter((code) => typeof code === "string");
}

/**
 * Checks that a refusal carries the expected error code.
 *
 * The status code has already been checked by ExpectProblem, the building block
 * for refusals, so what is left is which error the API gave: the top-level code,
 * or one of the codes of the validation errors under it.
 *
 * @param {*} problem The problem details body ExpectProblem returned.
 * @param {string} code The expected error code. See ProblemCode.
 * @param {string} operation Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the refusal carries that code.
 */
function CheckProblemCode(problem, code, operation) {
    const success = check(problem, {
        [`CheckProblemCode - ${operation} answers ${code}`]: (p) => problemCodes(p).includes(code),
    });

    if (!success) {
        console.error(`CheckProblemCode - ${operation} answered ${JSON.stringify(problem)}`);
    }

    return success;
}

/**
 * Checks that the delegation check let every right on the resource through.
 *
 * The counterpart of CheckDelegationCheckRefused, for a delegable resource the
 * caller holds every right on. A local copy that wrongly marked the resource as
 * not delegable would show up here as rights refused for ResourceNotDelegable.
 *
 * @param {import("../../../clients/access-management-bff/common/common.types.js").ResourceCheckDto|null} resourceCheck The delegation check response.
 * @param {string} operation Name of the operation, used in the logs.
 * @returns {boolean} True if every right is delegable.
 */
function CheckDelegationCheckGranted(resourceCheck, operation) {
    /** @type {Array<*>} */
    const rights = resourceCheck?.rights ?? [];

    const success = check(rights, {
        "CheckDelegationCheckGranted - the resource has rights to check": (r) => r.length > 0,
        "CheckDelegationCheckGranted - every right is delegable": (r) =>
            r.every((right) => right?.result === true),
        "CheckDelegationCheckGranted - no right is refused as not delegable": (r) =>
            r.every((right) => !(right?.reasonCodes ?? []).includes(DelegationCheckReasonCode.ResourceNotDelegable)),
    });

    if (!success) {
        console.error(`CheckDelegationCheckGranted - ${operation} did not let every right through: ${JSON.stringify(rights)}`);
    }

    return success;
}

/**
 * Checks that a resource request was created with the expected status.
 *
 * The building blocks have checked the status code and that the body parsed.
 * What is left is whether it is a request at all, and in the state the API
 * promises: Pending for an enduser request, Draft for a service owner one.
 *
 * @param {{id?: string, status?: string}|null} request The created request.
 * @param {string} status The status the request should have.
 * @param {string} operation Name of the operation, used in the check name and logs.
 * @returns {boolean} True if the request was created as expected.
 */
function CheckRequestCreated(request, status, operation) {
    const success = check(request, {
        [`CheckRequestCreated - ${operation} returns a request`]: (r) => Boolean(r?.id),
        [`CheckRequestCreated - ${operation} request is ${status}`]: (r) => r?.status === status,
    });

    if (!success) {
        console.error(`CheckRequestCreated - ${operation} returned: ${JSON.stringify(request)}`);
    }

    return success;
}

/**
 * Checks that the delegation check gave the reason to no right at all.
 *
 * For a case where a rule must not apply, such as an access list for a person:
 * the rights may well be refused for other reasons, but not for this one.
 *
 * @param {import("../../../clients/access-management-bff/common/common.types.js").ResourceCheckDto|null} resourceCheck The delegation check response.
 * @param {string} reasonCode The reason no right may carry. See DelegationCheckReasonCode.
 * @param {string} operation Name of the operation, used in the logs.
 * @returns {boolean} True if the check answered and no right carries the reason.
 */
function CheckNoRightRefusedFor(resourceCheck, reasonCode, operation) {
    const success = check(resourceCheck, {
        [`CheckNoRightRefusedFor - the check answered (${reasonCode})`]: (r) => Array.isArray(r?.rights),
        [`CheckNoRightRefusedFor - no right is refused for ${reasonCode}`]: (r) =>
            (r?.rights ?? []).every((/** @type {*} */ right) => !(right?.reasonCodes ?? []).includes(reasonCode)),
    });

    if (!success) {
        console.error(`CheckNoRightRefusedFor - ${operation} refused a right for ${reasonCode}: ${JSON.stringify(resourceCheck?.rights)}`);
    }

    return success;
}

/**
 * Checks that the delegation check allowed exactly the given actions, and
 * refused every other one for the given reason.
 *
 * For an access list limited to some actions: the actions on the list are let
 * through, the rest are refused because of the list.
 *
 * @param {import("../../../clients/access-management-bff/common/common.types.js").ResourceCheckDto|null} resourceCheck The delegation check response.
 * @param {Array<string>} allowedActions The actions that have to be delegable, e.g. ["read"].
 * @param {string} reasonCode The reason every other action has to be refused for.
 * @param {string} operation Name of the operation, used in the logs.
 * @returns {boolean} True if the rights split as expected.
 */
function CheckDelegationCheckActions(resourceCheck, allowedActions, reasonCode, operation) {
    /** @type {Array<*>} */
    const rights = resourceCheck?.rights ?? [];
    const isAllowed = (/** @type {*} */ right) => allowedActions.includes(right?.right?.action?.value);

    const success = check(rights, {
        [`CheckDelegationCheckActions - every listed action is delegable (${allowedActions.join(",")})`]: (r) =>
            allowedActions.every((action) => r.some((right) => right?.right?.action?.value === action && right?.result === true)),
        [`CheckDelegationCheckActions - every other action is refused for ${reasonCode}`]: (r) =>
            r.filter((right) => !isAllowed(right)).length > 0
            && r.filter((right) => !isAllowed(right)).every((right) => right?.result === false && (right?.reasonCodes ?? []).includes(reasonCode)),
    });

    if (!success) {
        console.error(`CheckDelegationCheckActions - ${operation} did not allow only ${allowedActions.join(",")}: ${JSON.stringify(rights)}`);
    }

    return success;
}

export const ResourceDelegationDomainChecks = {
    CheckDelegationCheckActions,
    CheckDelegationCheckGranted,
    CheckDelegationCheckRefused,
    CheckNoRightRefusedFor,
    CheckProblemCode,
    CheckRequestCreated,
};
