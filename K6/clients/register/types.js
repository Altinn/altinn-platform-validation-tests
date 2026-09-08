// Types from the Register API, as described by its swagger:
// https://github.com/Altinn/altinn-register
// (local run: http://localhost:5020/swagger/v1/swagger.json)
//
// Only the models reachable from the endpoints this repo calls are described
// here. Register serves several party shapes, and swagger models them as a
// discriminated union on `partyType`. JSDoc has no union with a shared base, so
// each variant is flattened into one typedef with the variant-specific fields
// marked optional, and the discriminator says which of them are present.
//
// The enumerations at the bottom are the exception to "types from the Register
// API": ErRoleFieldTypes belongs to the Enhetsregisteret SOAP service rather
// than to Register. It lives here because the two are keyed on the same role
// names, and a reader comparing them wants them side by side.

/**
 * A unique reference to a party in the form of an URN. Register accepts several
 * variants, and the "type" part of a party UUID URN is ignored on lookup, so a
 * request for `urn:altinn:person:uuid:X` also finds the organization X.
 *
 * Variants:
 * - `urn:altinn:party:id:123`
 * - `urn:altinn:party:uuid:<guid>`
 * - `urn:altinn:organization:identifier-no:123456789`
 * - `urn:altinn:person:identifier-no:<pid>`
 * - `urn:altinn:user:id:123`
 * - `urn:altinn:party:username:<username>`
 * - `urn:altinn:person:idporten-email:<email>`
 *
 * @typedef {string} PartyUrn
 */

/**
 * The party fields to include in a response. Sent as a comma separated list in
 * the `fields` query parameter. Field groups (`party`, `person`, `org`, `si`,
 * `user`, `identifiers`) expand to their members, and single fields
 * (`display-name`, `user.username`, ...) can be picked on their own.
 *
 * @typedef {string} PartyFieldInclude
 */

/**
 * User information for a party, as served by the internal party endpoints.
 *
 * @typedef {object} PartyUser
 * @property {number} [userId] The current user id.
 * @property {string} [username] The current username.
 * @property {Array<number>} [userIds] Every user id, including the current one.
 * @property {Array<string>} [usernames] Every username, including the current one.
 */

/**
 * A party, as served by the internal party endpoints. Which of the optional
 * fields are set follows from `partyType` and from the requested fields.
 *
 * @typedef {object} Party
 * @property {string} partyUuid
 * @property {number} versionId
 * @property {PartyUrn} [urn] Party UUID URN for this party.
 * @property {PartyUrn} [externalUrn] Reference to the party in its source system.
 * @property {number} [partyId]
 * @property {"person"|"organization"|"self-identified-user"|"system-user"|"enterprise-user"|string} partyType
 * Not exhaustive: Register may add party types, so an unknown string is valid.
 * @property {string} [displayName]
 * @property {string} [createdAt]
 * @property {string} [modifiedAt]
 * @property {boolean} [isDeleted]
 * @property {string|null} [deletedAt]
 * @property {PartyUser} [user]
 * @property {string} [personIdentifier] Person only. 11 digits.
 * @property {string} [organizationIdentifier] Organization only. 9 digits.
 * @property {string} [source] Person or organization only. Source system.
 * @property {string} [firstName] Person only.
 * @property {string} [middleName] Person only.
 * @property {string} [lastName] Person only.
 * @property {string} [shortName] Person only.
 * @property {string} [dateOfBirth] Person only.
 * @property {string|null} [dateOfDeath] Person only.
 * @property {string} [unitStatus] Organization only.
 * @property {string} [unitType] Organization only.
 * @property {string} [emailAddress] Organization only.
 * @property {string} [telephoneNumber] Organization only.
 * @property {string} [mobileNumber] Organization only.
 * @property {string} [internetAddress] Organization only.
 * @property {string} [selfIdentifiedUserType] Self-identified user only.
 * @property {string} [email] Self-identified user only.
 */

/**
 * An aggregate of a field's current value plus its historical ones.
 *
 * @typedef {object} PartyHistoricalAggregate
 * @property {string|number|null} [currentValue] The value in use now, if any.
 * @property {Array<string|number>} [values] Every value, current one included.
 */

/**
 * User information on a party record, which unlike PartyUser can carry
 * historical user ids.
 *
 * @typedef {object} PartyUserRecord
 * @property {number} [userId]
 * @property {string} [username]
 * @property {Array<number>} [userIds]
 */

/**
 * A database record for a party. Close to Party, but exposes the storage view:
 * the owner of the party, and historical user ids and usernames.
 *
 * The swagger has the access-management party query returning these, but at22
 * answers with Party. Nothing in this repo reads a PartyRecord yet, so this
 * typedef only describes the shape the spec documents.
 *
 * @typedef {object} PartyRecord
 * @property {string} [partyUuid]
 * @property {string} [ownerUuid] The party this one belongs to, for sub-parties.
 * @property {number} [partyId]
 * @property {"person"|"organization"|"self-identified-user"|"system-user"|"enterprise-user"} partyType
 * @property {PartyUrn} [externalUrn] Reference to the party in its source system.
 * @property {string} [displayName]
 * @property {string} [personIdentifier] Person only. 11 digits.
 * @property {string} [organizationIdentifier] Organization only. 9 digits.
 * @property {string} [createdAt]
 * @property {string} [modifiedAt]
 * @property {PartyHistoricalAggregate} [userIds]
 * @property {PartyHistoricalAggregate} [usernames]
 * @property {boolean} [isDeleted]
 * @property {string|null} [deletedAt]
 * @property {number} [versionId]
 * @property {PartyUserRecord} [user]
 * @property {string} [source] Person or organization only.
 * @property {string} [email] Self-identified user only.
 * @property {string} [extRef] Self-identified user only.
 * @property {string} [unitStatus] Organization only.
 * @property {string} [unitType] Organization only.
 */

/**
 * A list of parties.
 *
 * @typedef {object} PartyListObject
 * @property {Array<Party>} data The items.
 */

/**
 * A list of party records.
 *
 * @typedef {object} PartyRecordListObject
 * @property {Array<PartyRecord>} data The items.
 */

/**
 * The party identifiers to look up.
 *
 * @typedef {object} PartyUrnListObject
 * @property {Array<PartyUrn>} data The items.
 */

/**
 * The roles from the Central Coordinating Register (Enhetsregisteret) that a
 * party can hold on behalf of its customers, and that Register serves a customer
 * list for. The values are the last path segment of the endpoint.
 *
 * These three are the whole list. Altinn establishes a client relationship, so
 * that one organization can act for another, only for an organization registered
 * in ER as the other's revisor, regnskapsfører or forretningsfører. Any other ER
 * role, a daglig leder or a styremedlem for instance, says something about the
 * organization itself rather than about who may act for whom, so it produces no
 * customers to read here.
 *
 * Register has one endpoint per role rather than a role parameter, but they take
 * the same arguments and answer with the same shape, so the client models them
 * as one call. This object is the list of roles that call accepts.
 *
 * @readonly
 */
export const CcrCustomerRoles = {
    // Auditor.
    REVISOR: "revisor",
    // Accountant.
    REGNSKAPSFORER: "regnskapsforer",
    // Property manager.
    FORRETNINGSFORER: "forretningsforer",
};

/**
 * The roles from Enhetsregisteret that Register serves a holder list for: the
 * parties a given party has assigned the role to. The values are the last path
 * segment of the endpoint.
 *
 * The relation runs the other way than for CcrCustomerRoles, which is why the
 * holders live behind their own endpoint family and their own client method.
 *
 * @readonly
 */
export const CcrHolderRoles = {
    // General manager.
    DAGLIG_LEDER: "daglig-leder",
};

/**
 * The role codes ER uses in the `felttype` attribute of a change, keyed by the
 * role name Register serves its customers under. This is the whole reason the
 * client can take the role as a parameter: the batch is the same otherwise.
 *
 * The keys are the values of CcrCustomerRoles, which is what lets a test draw a
 * role once and use it against both services.
 *
 * @type {{[roleName: string]: string}}
 * @readonly
 */
export const ErRoleFieldTypes = {
    revisor: "REVI",
    regnskapsforer: "REGN",
    forretningsforer: "FFØR",
};

// Value exports so a building block can name the type it returns in an import
// and have the JSDoc reference resolve. There is nothing to import at runtime.

export const Party = undefined;
export const PartyFieldInclude = undefined;
export const PartyHistoricalAggregate = undefined;
export const PartyListObject = undefined;
export const PartyRecord = undefined;
export const PartyRecordListObject = undefined;
export const PartyUrn = undefined;
export const PartyUrnListObject = undefined;
export const PartyUser = undefined;
export const PartyUserRecord = undefined;
