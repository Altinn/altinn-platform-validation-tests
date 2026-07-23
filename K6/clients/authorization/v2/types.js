/**
 * @typedef {object} XacmlRequestApiModel
 * @property {string|null} [bodyContent]
 */

/**
 * @typedef {object} XacmlJsonRequestRootExternal
 * @property {XacmlJsonRequestExternal|null} [request]
 */

/**
 * @typedef {object} XacmlJsonRequestExternal
 * @property {boolean} [returnPolicyIdList]
 * @property {boolean} [combinedDecision]
 * @property {string|null} [xPathVersion]
 * @property {XacmlJsonCategoryExternal[]|null} [category]
 * @property {XacmlJsonCategoryExternal[]|null} [resource]
 * @property {XacmlJsonCategoryExternal[]|null} [action]
 * @property {XacmlJsonCategoryExternal[]|null} [accessSubject]
 * @property {XacmlJsonCategoryExternal[]|null} [recipientSubject]
 * @property {XacmlJsonCategoryExternal[]|null} [intermediarySubject]
 * @property {XacmlJsonCategoryExternal[]|null} [requestingMachine]
 * @property {XacmlJsonMultiRequestsExternal|null} [multiRequests]
 */

/**
 * @typedef {object} XacmlJsonResponseExternal
 * @property {XacmlJsonResultExternal[]|null} [response]
 */

/**
 * @typedef {object} XacmlJsonResultExternal
 * @property {string|null} [decision]
 * @property {XacmlJsonStatusExternal|null} [status]
 * @property {XacmlJsonObligationOrAdviceExternal[]|null} [obligations]
 * @property {XacmlJsonObligationOrAdviceExternal[]|null} [associateAdvice]
 * @property {XacmlJsonCategoryExternal[]|null} [category]
 * @property {XacmlJsonPolicyIdentifierListExternal|null} [policyIdentifierList]
 *
 *
 * /**
 * @typedef {object} XacmlJsonStatusExternal
 * @property {string|null} [statusMessage]
 * @property {string[]|null} [statusDetails]
 * @property {XacmlJsonStatusCodeExternal|null} [statusCode]
 */

/**
 * @typedef {object} XacmlJsonStatusCodeExternal
 * @property {string|null} [value]
 * @property {XacmlJsonStatusCodeExternal|null} [statusCode]
 */

/**
 * @typedef {object} XacmlJsonCategoryExternal
 * @property {string|null} [categoryId]
 * @property {string|null} [id]
 * @property {string|null} [content]
 * @property {XacmlJsonAttributeExternal[]|null} [attribute]
 */

/**
 * @typedef {object} XacmlJsonAttributeExternal
 * @property {string|null} [attributeId]
 * @property {string|null} [value]
 * @property {string|null} [issuer]
 * @property {string|null} [dataType]
 * @property {boolean} [includeInResult]
 */

/**
 * @typedef {object} XacmlJsonObligationOrAdviceExternal
 * @property {string|null} [id]
 * @property {XacmlJsonAttributeAssignmentExternal[]|null} [attributeAssignment]
 */

/**
 * @typedef {object} XacmlJsonAttributeAssignmentExternal
 * @property {string|null} [attributeId]
 * @property {string|null} [value]
 * @property {string|null} [category]
 * @property {string|null} [dataType]
 * @property {string|null} [issuer]
 *
 *
 * /**
 * @typedef {object} XacmlJsonPolicyIdentifierListExternal
 * @property {XacmlJsonIdReferenceExternal[]|null} [policyIdReference]
 * @property {XacmlJsonIdReferenceExternal[]|null} [policySetIdReference]
 */

/**
 * @typedef {object} XacmlJsonIdReferenceExternal
 * @property {string|null} [id]
 * @property {string|null} [version]
 */

/**
 * @typedef {object} XacmlJsonMultiRequestsExternal
 * @property {XacmlJsonRequestReferenceExternal[]|null} [requestReference]
 */

/**
 * @typedef {object} XacmlJsonRequestReferenceExternal
 * @property {string[]|null} [referenceId]
 */
