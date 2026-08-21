/**
 * @typedef {object} AccessPackage
 * @property {string|null} [urn]
 */

/**
 * @typedef {object} AgentRequestSystemResponse
 * @property {string} id
 * @property {string|null} [externalRef]
 * @property {string} systemId
 * @property {string} partyOrgNo
 * @property {Array<AccessPackage>} accessPackages
 * @property {string} status
 * @property {string|null} [redirectUrl]
 * @property {string|null} [confirmUrl]
 */

/**
 * A paginated Altinn.Platform.Authentication.Model.ListObject`1.
 *
 * @typedef {object} AgentRequestSystemResponsePaginated
 * @property {Array<AgentRequestSystemResponse>|null} [data] The items.
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} AttributePair
 * @property {string} id
 * @property {string} value
 */

/**
 * @typedef {object} ChangeRequestResponse
 * @property {string} id
 * @property {string|null} [externalRef]
 * @property {string} systemId
 * @property {string} systemUserId
 * @property {string} partyOrgNo
 * @property {Array<Right>|null} [requiredRights]
 * @property {Array<Right>|null} [unwantedRights]
 * @property {Array<AccessPackage>|null} [requiredAccessPackages]
 * @property {Array<AccessPackage>|null} [unwantedAccessPackages]
 * @property {string} status
 * @property {string|null} [redirectUrl]
 * @property {string|null} [confirmUrl]
 */

/**
 * A paginated Altinn.Platform.Authentication.Model.ListObject`1.
 *
 * @typedef {object} ChangeRequestResponsePaginated
 * @property {Array<ChangeRequestResponse>|null} [data] The items.
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} ChangeRequestSystemUser
 * @property {Array<Right>|null} [requiredRights]
 * @property {Array<Right>|null} [unwantedRights]
 * @property {Array<AccessPackage>|null} [requiredAccessPackages]
 * @property {Array<AccessPackage>|null} [unwantedAccessPackages]
 * @property {string|null} [redirectUrl]
 */

/**
 * Represents the response containing delegation details between an agent and a client.
 *
 * @typedef {object} ClientDelegationResponse
 * @property {string} agent Gets or sets the unique identifier for the agent.
 * @property {string} client Gets or sets the unique identifier for the client.
 */

/**
 * Represents information about a client, including their organization number and name.
 *
 * @typedef {object} ClientInfo
 * @property {string} clientId Gets or sets the unique identifier for the client.
 * @property {string|null} [clientOrganizationNumber] Gets or sets the organization number associated with the client.
 * @property {string|null} [clientOrganizationName] Gets or sets the name of the client organization.
 */

/**
 * A paginated Altinn.Platform.Authentication.Model.ListObject`1.
 *
 * @typedef {object} ClientInfoClientInfoPaginated
 * @property {Array<ClientInfo>|null} [data] The items.
 * @property {PaginatedLinks} links
 * @property {SystemUserInfo} systemUserInformation
 */

/**
 * @typedef {object} CreateAgentRequestSystemUser
 * @property {string|null} [externalRef]
 * @property {string} systemId
 * @property {string} partyOrgNo
 * @property {Array<AccessPackage>} accessPackages
 * @property {string|null} [redirectUrl]
 */

/**
 * @typedef {object} CreateRequestSystemUser
 * @property {string|null} [externalRef]
 * @property {string} systemId
 * @property {string} partyOrgNo
 * @property {Array<Right>|null} [rights]
 * @property {Array<AccessPackage>|null} [accessPackages]
 * @property {string|null} [redirectUrl]
 */

/**
 * @typedef {object} DelegationResponse
 * @property {string} agentSystemUserId
 * @property {string} delegationId
 * @property {string|null} [customerId]
 * @property {string|null} [assignmentId]
 * @property {string|null} [customerName]
 */

/**
 * Represents the well known discovery document described by "OpenID Connect Discovery 1.0 incorporating errata set 1" URL: https://openid.net/specs/openid-connect-discovery-1_0.html (and other specifications)
 *
 * @typedef {object} DiscoveryDocument
 * @property {string|null} [issuer] URL of the issuer
 * @property {string|null} [jwks_uri] URL of the JSON Web Key Set document.
 * @property {string|null} [authorization_endpoint] URL of the OAuth 2.0 Authorization Endpoint.
 * @property {string|null} [token_endpoint] URL of the OAuth 2.0 Token Endpoint.
 * @property {string|null} [userinfo_endpoint] Url of the UserInfo Endpoint.
 * @property {string|null} [end_session_endpoint] URL of the end session Endpoint.
 * @property {string|null} [check_session_iframe] URL for the session check Endpoint.
 * @property {string|null} [revocation_endpoint] URL for the revocation endpoint.
 * @property {string|null} [introspection_endpoint] URL for the introspection endpoint.
 * @property {boolean|null} [frontchannel_logout_supported] Value indicating whether there is a front channel mechanism for logout.
 * @property {boolean|null} [frontchannel_logout_session_supported] Value indicating wheter there is a front channel mechanism for session logout.
 * @property {Array<string>|null} [scopes_supported] Array of supported scopes.
 * @property {Array<string>|null} [claims_supported] Array of supported claims.
 * @property {Array<string>|null} [response_types_supported] Array of supported response types.
 * @property {Array<string>|null} [response_modes_supported] Array of supported response modes.
 * @property {Array<string>|null} [grant_types_supported] Array of supported grant types.
 * @property {Array<string>|null} [subject_types_supported] Array of supported subject types.
 * @property {Array<string>|null} [id_token_signing_alg_values_supported] Array of supported signing algorithms.
 * @property {Array<string>|null} [token_endpoint_auth_methods_supported] Array of supported authentication methods on the token endpoint.
 * @property {Array<string>|null} [code_challenge_methods_supported] Array of supported code challenge methods.
 */

/**
 * An opaque value is a value that can be transmitted to another party without divulging any type information or expectations about the value. Opaque values are typically usefull in APIs where the server wants to be able to return a value that the client later needs to send back to the server, but where the server does not want to expose the type of the value to the client. For instance, in a pagination scenario, the server can use an opaque int to do pagination by page number, while allowing itself to later change the implementation to use a cursor instead of a page number without breaking the API.
 *
 * @typedef {object} GuidOpaque
 * @property {string} value Gets the inner value.
 */

/**
 * An opaque value is a value that can be transmitted to another party without divulging any type information or expectations about the value. Opaque values are typically usefull in APIs where the server wants to be able to return a value that the client later needs to send back to the server, but where the server does not want to expose the type of the value to the client. For instance, in a pagination scenario, the server can use an opaque int to do pagination by page number, while allowing itself to later change the implementation to use a cursor instead of a page number without breaking the API.
 *
 * @typedef {object} Int64Opaque
 * @property {number} value Gets the inner value.
 */

/**
 * Introspection response object
 *
 * @typedef {object} IntrospectionResponse
 * @property {boolean} active Gets or sects the active property indicating if the request token was valid
 * @property {string|null} [iss] Gets or sets the issuer of the validated request token.
 */

/**
 * Item stream statistics.
 *
 * @typedef {object} ItemStreamStats
 * @property {number} pageStart The first item on the page.
 * @property {number} pageEnd The last item on the page.
 * @property {number} sequenceMax The highest item in the database.
 */

/**
 * Represents a Json Wen Key as described by "JSON Web Key (JWK) draft-ietf-jose-json-web-key-41" URL: https://tools.ietf.org/html/draft-ietf-jose-json-web-key-41
 *
 * @typedef {object} JwkDocument
 * @property {string|null} [kty] Gets or sets the type of key this is. E.g. RSA
 * @property {string|null} [use] Gets or sets the type of use. E.g. sig
 * @property {string|null} [kid] Gets or sets a unique id for the key.
 * @property {string|null} [e] Gets or sets the RSA exponent value of the key.
 * @property {string|null} [n] Gets or sets the RSA modulus value of the key.
 * @property {Array<string>|null} [x5c] Gets or sets a list of base64 encoded certificate where each new item is the parent certificate of the previous in a certificate chain.
 */

/**
 * Represents a Json Wen Key set as described by "JSON Web Key (JWK) draft-ietf-jose-json-web-key-41" URL: https://tools.ietf.org/html/draft-ietf-jose-json-web-key-41
 *
 * @typedef {object} JwksDocument
 * @property {Array<JwkDocument>|null} [keys] Gets or sets the list of keys in the key set.
 */

/**
 * Pagination links.
 *
 * @typedef {object} PaginatedLinks
 * @property {string|null} [next] Link to the next page of items (if any).
 */

/**
 * @typedef {object} ProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 */

/**
 * @typedef {object} RegisterSystemRequest
 * @property {string|null} [id]
 * @property {VendorInfo} vendor
 * @property {{[key: string]: string}|null} [name]
 * @property {{[key: string]: string}|null} [description]
 * @property {Array<Right>|null} [rights]
 * @property {Array<AccessPackage>|null} [accessPackages]
 * @property {Array<string>|null} [clientId]
 * @property {boolean} isVisible
 * @property {Array<string>|null} [allowedRedirectUrls]
 */

/**
 * @typedef {object} RegisteredSystemDTO
 * @property {string|null} [systemId]
 * @property {string|null} [systemVendorOrgNumber]
 * @property {string|null} [systemVendorOrgName]
 * @property {{[key: string]: string}|null} [name]
 * @property {{[key: string]: string}|null} [description]
 * @property {Array<Right>|null} [rights]
 * @property {Array<AccessPackage>|null} [accessPackages]
 * @property {boolean} isVisible
 */

/**
 * @typedef {object} RegisteredSystemResponse
 * @property {string|null} [id]
 * @property {VendorInfo} vendor
 * @property {{[key: string]: string}|null} [name]
 * @property {{[key: string]: string}|null} [description]
 * @property {Array<Right>|null} [rights]
 * @property {Array<AccessPackage>|null} [accessPackages]
 * @property {boolean} isDeleted
 * @property {Array<string>|null} [clientId]
 * @property {boolean} isVisible
 * @property {Array<string>|null} [allowedRedirectUrls]
 */

/**
 * @typedef {object} RequestSystemResponse
 * @property {string} id
 * @property {string|null} [externalRef]
 * @property {string} systemId
 * @property {string} partyOrgNo
 * @property {Array<Right>} rights
 * @property {Array<AccessPackage>} accessPackages
 * @property {string} status
 * @property {string|null} [redirectUrl]
 * @property {string|null} [confirmUrl]
 */

/**
 * A paginated Altinn.Platform.Authentication.Model.ListObject`1.
 *
 * @typedef {object} RequestSystemResponsePaginated
 * @property {Array<RequestSystemResponse>|null} [data] The items.
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} Right
 * @property {string|null} [action]
 * @property {Array<AttributePair>|null} [resource]
 */

/**
 * @typedef {object} SystemChangeLog
 * @property {string} systemInternalId
 * @property {string|null} [changedByOrgNumber]
 * @property {SystemChangeType} changeType
 * @property {*|null} [changedData]
 * @property {string|null} [clientId]
 * @property {string|null} [created]
 */

/**
 * @typedef {"create"|"update"|"rightsupdate"|"accesspackageupdate"|"delete"|"unknown"} SystemChangeType
 */

/**
 * @typedef {object} SystemRegisterUpdateResult
 * @property {boolean} succeeded
 */

/**
 * @typedef {object} SystemUser
 * @property {string|null} [id]
 * @property {string|null} [integrationTitle]
 * @property {string|null} [systemId]
 * @property {string|null} [productName]
 * @property {string|null} [systemInternalId]
 * @property {string|null} [partyId]
 * @property {string|null} [partyUuId]
 * @property {string|null} [reporteeOrgNo]
 * @property {string} created
 * @property {boolean} isDeleted
 * @property {string|null} [supplierName]
 * @property {string|null} [supplierOrgno]
 * @property {string|null} [externalRef]
 * @property {Array<AccessPackage>|null} [accessPackages]
 * @property {SystemUserType} userType
 */

/**
 * information about a system user.
 *
 * @typedef {object} SystemUserInfo
 * @property {string} systemUserId Gets or sets the unique identifier for the system user.
 * @property {string|null} [systemUserOwnerOrg] Gets or sets the organization associated with the system user.
 */

/**
 * A paginated Altinn.Platform.Authentication.Model.ListObject`1.
 *
 * @typedef {object} SystemUserPaginated
 * @property {Array<SystemUser>|null} [data] The items.
 * @property {PaginatedLinks} links
 */

/**
 * @typedef {object} SystemUserRegisterDTO
 * @property {string|null} [id]
 * @property {string|null} [partyOrgNo]
 * @property {string|null} [partyId]
 * @property {string|null} [integrationTitle]
 * @property {boolean} isDeleted
 * @property {string} lastChanged
 * @property {string} created
 * @property {number} sequenceNo
 * @property {SystemUserType} systemUserType
 */

/**
 * A stream of all <typeparamref name="T" /> items in a data source.
 *
 * @typedef {object} SystemUserRegisterDTOItemStream
 * @property {Array<SystemUserRegisterDTO>|null} [data] The items.
 * @property {PaginatedLinks} links
 * @property {ItemStreamStats} stats
 */

/**
 * @typedef {"standard"|"agent"} SystemUserType
 */

/**
 * @typedef {object} SystemUserUpdateDto
 * @property {string|null} [id]
 * @property {string|null} [partyId]
 * @property {string|null} [reporteeOrgNo]
 * @property {string|null} [integrationTitle]
 * @property {string|null} [systemId]
 */

/**
 * @typedef {object} VendorInfo
 * @property {string|null} [ID]
 */

/**
 * Query parameters for looking a system user up by its external id.
 *
 * @typedef {object} SystemUserByExternalIdQuery
 * @property {string} [clientId] Client id of the system.
 * @property {string} [systemProviderOrgNo] Organisation number of the system provider.
 * @property {string} [systemUserOwnerOrgNo] Organisation number of the system user owner.
 * @property {string} [externalRef] External reference the system user was created with.
 */

/**
 * Query parameters for the vendor system user lookup.
 *
 * @typedef {object} SystemUserVendorQuery
 * @property {string} [orgno] Organisation number to look up.
 */

/**
 * Query parameters for the paged system user reads.
 *
 * @typedef {object} SystemUserPagedQuery
 * @property {Int64Opaque|number} [token] Continuation token, either the opaque value or the number inside it.
 */

export const AccessPackage = undefined;
export const AgentRequestSystemResponse = undefined;
export const AgentRequestSystemResponsePaginated = undefined;
export const AttributePair = undefined;
export const ChangeRequestResponse = undefined;
export const ChangeRequestResponsePaginated = undefined;
export const ChangeRequestSystemUser = undefined;
export const ClientDelegationResponse = undefined;
export const ClientInfo = undefined;
export const ClientInfoClientInfoPaginated = undefined;
export const CreateAgentRequestSystemUser = undefined;
export const CreateRequestSystemUser = undefined;
export const DelegationResponse = undefined;
export const DiscoveryDocument = undefined;
export const GuidOpaque = undefined;
export const Int64Opaque = undefined;
export const IntrospectionResponse = undefined;
export const ItemStreamStats = undefined;
export const JwkDocument = undefined;
export const JwksDocument = undefined;
export const PaginatedLinks = undefined;
export const ProblemDetails = undefined;
export const RegisterSystemRequest = undefined;
export const RegisteredSystemDTO = undefined;
export const RegisteredSystemResponse = undefined;
export const RequestSystemResponse = undefined;
export const RequestSystemResponsePaginated = undefined;
export const Right = undefined;
export const SystemChangeLog = undefined;
export const SystemChangeType = undefined;
export const SystemRegisterUpdateResult = undefined;
export const SystemUser = undefined;
export const SystemUserByExternalIdQuery = undefined;
export const SystemUserInfo = undefined;
export const SystemUserPagedQuery = undefined;
export const SystemUserPaginated = undefined;
export const SystemUserRegisterDTO = undefined;
export const SystemUserRegisterDTOItemStream = undefined;
export const SystemUserType = undefined;
export const SystemUserUpdateDto = undefined;
export const SystemUserVendorQuery = undefined;
export const VendorInfo = undefined;
