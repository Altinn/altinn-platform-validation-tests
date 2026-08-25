import { XacmlJsonAttributeExternal, XacmlJsonCategoryExternal, XacmlJsonMultiRequestsExternal, XacmlJsonRequestExternal, XacmlJsonRequestReferenceExternal, XacmlJsonRequestRootExternal, XacmlRequestApiModel } from "./types.js";

/**
 * Creates an XACML JSON Attribute.
 *
 * @param {Partial<XacmlJsonAttributeExternal>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlJsonAttributeExternal} An XACML JSON Attribute.
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
 * Creates an XACML JSON Request Reference.
 *
 * @param {Partial<XacmlJsonRequestReferenceExternal>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlJsonRequestReferenceExternal} An XACML JSON Request Reference.
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
 * Creates an XACML JSON Category.
 *
 * categoryId is only mandatory for categories placed in the generic "category"
 * member array, and is therefore left unset by default.
 *
 * @param {Partial<XacmlJsonCategoryExternal>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlJsonCategoryExternal} An XACML JSON Category.
 */
export function buildXacmlJsonCategoryExternal(overrides = {}) {
    return {
        categoryId: null,
        id: null,
        content: null,
        attribute: [
            buildXacmlJsonAttributeExternal(),
        ],
        ...overrides,
    };
}

/**
 * Creates an XACML JSON Multi Requests object.
 *
 * @param {Partial<XacmlJsonMultiRequestsExternal>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlJsonMultiRequestsExternal} An XACML JSON Multi Requests object.
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
 * The subject, resource and action attributes are placed in the named members
 * the PDP expects them in, leaving the generic "category" member empty.
 *
 * @param {Partial<XacmlJsonRequestExternal>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlJsonRequestExternal} An XACML JSON request.
 */
export function buildXacmlJsonRequestExternal(overrides = {}) {
    return {
        returnPolicyIdList: false,
        combinedDecision: false,
        xPathVersion: null,
        category: [],
        resource: [
            buildXacmlJsonCategoryExternal({
                attribute: [
                    buildXacmlJsonAttributeExternal({
                        attributeId: "urn:oasis:names:tc:xacml:1.0:resource:resource-id",
                    }),
                ],
            }),
        ],
        action: [
            buildXacmlJsonCategoryExternal({
                attribute: [
                    buildXacmlJsonAttributeExternal({
                        attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
                    }),
                ],
            }),
        ],
        accessSubject: [
            buildXacmlJsonCategoryExternal(),
        ],
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
 * Properties that should replace the defaults.
 * @returns {XacmlJsonRequestRootExternal} An XACML JSON request root.
 */
export function buildXacmlJsonRequestRootExternal(overrides = {}) {
    return {
        request: buildXacmlJsonRequestExternal(),
        ...overrides,
    };
}

/**
 * Creates an internal XACML API request model.
 *
 * @param {Partial<XacmlRequestApiModel>} [overrides]
 * Properties that should replace the defaults.
 * @returns {XacmlRequestApiModel} An internal XACML API request model.
 */
export function buildXacmlRequestApiModel(overrides = {}) {
    return {
        bodyContent: "{}",
        ...overrides,
    };
}
