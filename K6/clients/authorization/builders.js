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
 * Assembles a subject, an action and a resource into a request the Authorize and
 * Decision endpoints accept.
 *
 * The three builders above are generic enough to build anything XACML allows, which
 * means every caller writes the same three levels of nesting to ask one question.
 * This is that nesting, once: what differs between callers is which attributes
 * identify the subject and the resource.
 *
 * @param {string} action - Action, e.g. read, write or sign.
 * @param {XacmlJsonAttributeExternal[]} subjectAttributes - Attributes identifying who is asking.
 * @param {XacmlJsonAttributeExternal[]} resourceAttributes - Attributes identifying what is being reached.
 * @returns {XacmlJsonRequestRootExternal} An authorization request.
 */
export function buildAuthorizeRequest(action, subjectAttributes, resourceAttributes) {
    return buildXacmlJsonRequestRootExternal({
        request: buildXacmlJsonRequestExternal({
            accessSubject: [
                buildXacmlJsonCategoryExternal({
                    attribute: subjectAttributes,
                }),
            ],
            action: [
                buildXacmlJsonCategoryExternal({
                    attribute: [
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
                            value: action,
                        }),
                    ],
                }),
            ],
            resource: [
                buildXacmlJsonCategoryExternal({
                    attribute: resourceAttributes,
                }),
            ],
        }),
    });
}

/**
 * Builds the question "may this system user do this to this resource, for this
 * organisation".
 *
 * A system user is named by its own uuid rather than by a person or an
 * organisation, which is what sets it apart from the requests an end user makes.
 * The organisation goes on the resource side: it is the party the resource belongs
 * to, so it is what says whose data is being reached.
 *
 * @param {string} systemUserId - Identifier of the system user asking.
 * @param {string} resourceId - Resource the system user wants to reach.
 * @param {string} orgNo - Organisation number of the party the resource belongs to.
 * @param {string} action - Action, e.g. read or write.
 * @returns {XacmlJsonRequestRootExternal} An authorization request.
 */
export function buildSystemUserRequest(systemUserId, resourceId, orgNo, action) {
    return buildAuthorizeRequest(
        action,
        [
            buildXacmlJsonAttributeExternal({
                attributeId: "urn:altinn:systemuser:uuid",
                value: systemUserId,
            }),
        ],
        [
            buildXacmlJsonAttributeExternal({
                attributeId: "urn:altinn:resource",
                value: resourceId,
            }),
            buildXacmlJsonAttributeExternal({
                attributeId: "urn:altinn:organization:identifier-no",
                value: orgNo,
            }),
        ],
    );
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
