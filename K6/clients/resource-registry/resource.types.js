/**
 * @typedef {object} ServiceResource
 * @property {string} identifier Resource identifier. Must match ^[a-z0-9_-]{4,}$.
 * @property {string|null} [version] Resource version.
 * @property {{[language: string]: string}} title Title per language. nb, nn and en are required.
 * @property {{[language: string]: string}} description Description per language. nb, nn and en are required.
 * @property {{[language: string]: string}|null} [rightDescription] Right description per language.
 * nb, nn and en are required when the resource is delegable.
 * @property {string|null} [homepage] Homepage URL.
 * @property {string|null} [status] Resource status, for instance Completed.
 * @property {Array<string>|null} [spatial] Spatial coverage.
 * @property {Array<ContactPoint>} contactPoints Contact points.
 * @property {Array<string>|null} [produces] What the resource produces.
 * @property {string|null} [isPartOf] Larger service this resource is part of.
 * @property {Array<string>|null} [thematicAreas] Thematic areas.
 * @property {Array<ResourceReference>|null} [resourceReferences] References to other systems.
 * @property {boolean} [delegable] Whether the resource can be delegated.
 * @property {boolean} [visible] Whether the resource is visible in the portal.
 * @property {CompetentAuthority} hasCompetentAuthority Resource owner.
 * @property {Array<Keyword>|null} [keywords] Keywords.
 * @property {string} [accessListMode] Access list mode, see ResourceAccessListMode.
 * @property {boolean} [selfIdentifiedUserEnabled] Whether self identified users get access.
 * @property {boolean} [enterpriseUserEnabled] Whether enterprise users get access.
 * @property {string} resourceType Resource type, see ResourceType.
 * @property {Array<string>|null} [availableForType] Party types, see ResourcePartyType.
 * @property {Array<AuthorizationReferenceAttribute>|null} [authorizationReference] Authorization reference.
 * @property {string|null} [consentTemplate] Consent template identifier.
 * @property {{[language: string]: string}|null} [consentText] Consent text per language.
 * @property {{[key: string]: ConsentMetadata}|null} [consentMetadata] Consent metadata.
 * @property {boolean} [isOneTimeConsent] Whether the consent is one time only.
 * @property {number} [versionId] Version identifier assigned by the registry.
 */

/**
 * @typedef {object} CompetentAuthority
 * @property {string|null} [organization] Organization number. Required unless orgcode is ttd.
 * @property {string|null} [orgcode] Service owner code, for instance ttd.
 * @property {{[language: string]: string}|null} [name] Name per language.
 */

/**
 * @typedef {object} ContactPoint
 * @property {string|null} [category] Contact category.
 * @property {string|null} [email] Email address.
 * @property {string|null} [telephone] Telephone number.
 * @property {string|null} [contactPage] Contact page URL.
 */

/**
 * @typedef {object} Keyword
 * @property {string|null} [word] The keyword.
 * @property {string|null} [language] Language code.
 */

/**
 * @typedef {object} ResourceReference
 * @property {string} [referenceSource] See ReferenceSource.
 * @property {string|null} [reference] The reference value.
 * @property {string} [referenceType] See ReferenceType.
 */

/**
 * @typedef {object} AuthorizationReferenceAttribute
 * @property {string|null} [id] Attribute identifier.
 * @property {string|null} [value] Attribute value.
 */

/**
 * @typedef {object} ConsentMetadata
 * @property {boolean} [optional] Whether the metadata field is optional.
 */
