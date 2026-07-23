// import { XacmlJsonAttributeExternalBuilder } from "./types.js";

/**
 * Creates an XACML JSON Attribute.
 *
 * @param {Partial<XacmlJsonAttributeExternal>} [overrides]
 * @returns {XacmlJsonAttributeExternal}
 */
export function buildXacmlJsonAttributeExternal(overrides = {}) {
    return {
        attributeId: "urn:oasis:names:tc:xacml:1.0:subject:subject-id",
        value: "test-value",
        issuer: null,
        dataType: "http://www.w3.org/2001/XMLSchema#string",
        includeInResult: false,
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Attribute Assignment.
 *
 * @param {Partial<XacmlJsonAttributeAssignmentExternal>} [overrides]
 * @returns {XacmlJsonAttributeAssignmentExternal}
 */
export function buildXacmlJsonAttributeAssignmentExternal(
    overrides = {},
) {
    return {
        attributeId: "urn:test:attribute",
        value: "test-value",
        category: null,
        dataType: "http://www.w3.org/2001/XMLSchema#string",
        issuer: null,
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Policy Identifier Reference.
 *
 * @param {Partial<XacmlJsonIdReferenceExternal>} [overrides]
 * @returns {XacmlJsonIdReferenceExternal}
 */
export function buildXacmlJsonIdReferenceExternal(overrides = {}) {
    return {
        id: "urn:test:policy",
        version: "1.0",
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Request Reference.
 *
 * @param {Partial<XacmlJsonRequestReferenceExternal>} [overrides]
 * @returns {XacmlJsonRequestReferenceExternal}
 */
export function buildXacmlJsonRequestReferenceExternal(overrides = {}) {
    return {
        referenceId: [
            "request-reference",
        ],
        ...overrides,
    };
}

/**
 * Creates an opaque GUID pagination value.
 *
 * @param {Partial<GuidOpaque>} [overrides]
 * @returns {GuidOpaque}
 */
export function buildGuidOpaque(overrides = {}) {
    return {
        value: "00000000-0000-0000-0000-000000000000",
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Category.
 *
 * @param {Partial<XacmlJsonCategoryExternal>} [overrides]
 * @returns {XacmlJsonCategoryExternal}
 */
export function buildXacmlJsonCategoryExternal(overrides = {}) {
    return {
        categoryId: "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
        id: null,
        content: null,
        attribute: [
            buildXacmlJsonAttributeExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Obligation or Advice object.
 *
 * @param {Partial<XacmlJsonObligationOrAdviceExternal>} [overrides]
 * @returns {XacmlJsonObligationOrAdviceExternal}
 */
export function buildXacmlJsonObligationOrAdviceExternal(overrides = {}) {
    return {
        id: "urn:test:obligation",
        attributeAssignment: [
            buildXacmlJsonAttributeAssignmentExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Status Code.
 *
 * @param {Partial<XacmlJsonStatusCodeExternal>} [overrides]
 * @returns {XacmlJsonStatusCodeExternal}
 */
export function buildXacmlJsonStatusCodeExternal(overrides = {}) {
    return {
        value: "urn:oasis:names:tc:xacml:1.0:status:ok",
        statusCode: null,
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Status.
 *
 * @param {Partial<XacmlJsonStatusExternal>} [overrides]
 * @returns {XacmlJsonStatusExternal}
 */
export function buildXacmlJsonStatusExternal(overrides = {}) {
    return {
        statusMessage: "Success",
        statusDetails: [],
        statusCode: buildXacmlJsonStatusCodeExternal(),
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Policy Identifier List.
 *
 * @param {Partial<XacmlJsonPolicyIdentifierListExternal>} [overrides]
 * @returns {XacmlJsonPolicyIdentifierListExternal}
 */
export function buildXacmlJsonPolicyIdentifierListExternal(
    overrides = {},
) {
    return {
        policyIdReference: [
            buildXacmlJsonIdReferenceExternal(),
        ],
        policySetIdReference: [
            buildXacmlJsonIdReferenceExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Multi Requests object.
 *
 * @param {Partial<XacmlJsonMultiRequestsExternal>} [overrides]
 * @returns {XacmlJsonMultiRequestsExternal}
 */
export function buildXacmlJsonMultiRequestsExternal(overrides = {}) {
    return {
        requestReference: [
            buildXacmlJsonRequestReferenceExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an XACML JSON request.
 *
 * @param {Partial<XacmlJsonRequestExternal>} [overrides]
 * @returns {XacmlJsonRequestExternal}
 */
export function buildXacmlJsonRequestExternal(overrides = {}) {
    return {
        returnPolicyIdList: false,
        combinedDecision: false,
        xPathVersion: null,
        category: [
            buildXacmlJsonCategoryExternal(),
        ],
        resource: [],
        action: [],
        accessSubject: [],
        recipientSubject: [],
        intermediarySubject: [],
        requestingMachine: [],
        multiRequests: null,
        ...overrides,
    };
}

/**
 * Creates an XACML JSON request root.
 *
 * @param {Partial<XacmlJsonRequestRootExternal>} [overrides]
 * @returns {XacmlJsonRequestRootExternal}
 */
export function buildXacmlJsonRequestRootExternal(overrides = {}) {
    return {
        request: buildXacmlJsonRequestExternal(),
        ...overrides,
    };
}

/**
 * Creates an XACML JSON result.
 *
 * @param {Partial<XacmlJsonResultExternal>} [overrides]
 * @returns {XacmlJsonResultExternal}
 */
export function buildXacmlJsonResultExternal(overrides = {}) {
    return {
        decision: "Permit",
        status: buildXacmlJsonStatusExternal(),
        obligations: [],
        associateAdvice: [],
        category: [],
        policyIdentifierList: null,
        ...overrides,
    };
}

/**
 * Creates an XACML JSON response.
 *
 * @param {Partial<XacmlJsonResponseExternal>} [overrides]
 * @returns {XacmlJsonResponseExternal}
 */
export function buildXacmlJsonResponseExternal(overrides = {}) {
    return {
        response: [
            buildXacmlJsonResultExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an internal XACML API request model.
 *
 * @param {Partial<XacmlRequestApiModel>} [overrides]
 * @returns {XacmlRequestApiModel}
 */
export function buildXacmlRequestApiModel(overrides = {}) {
    return {
        bodyContent: "{}",
        ...overrides,
    };
}
