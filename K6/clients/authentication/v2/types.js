/**
 * Represents a request to update an existing SystemUser.
 *
 * @typedef {Object} SystemUserUpdateDto
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string|null} integrationTitle Integration title.
 * @property {string|null} systemId System identifier.
 */

/**
 * Represents a SystemUser integration.
 *
 * @typedef {Object} SystemUser
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} integrationTitle Integration title.
 * @property {string|null} systemId External system identifier.
 * @property {string|null} productName Product name.
 * @property {string|null} systemInternalId Internal system UUID.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} partyUuId Party UUID.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string} created Creation timestamp.
 * @property {boolean} isDeleted Whether the SystemUser is deleted.
 * @property {string|null} supplierName Supplier name.
 * @property {string|null} supplierOrgno Supplier organisation number.
 * @property {string|null} externalRef External reference.
 * @property {AccessPackage[]|null} accessPackages Assigned access packages.
 * @property {SystemUserType|null} userType System user type.
 */

/**
 * Represents a paginated list of SystemUsers.
 *
 * @typedef {Object} SystemUserPaginated
 * @property {SystemUser[]|null} data SystemUser items.
 * @property {PaginatedLinks|null} links Pagination links.
 */

/**
 * Represents a paginated stream of SystemUser register items.
 *
 * @typedef {Object} SystemUserRegisterDTOItemStream
 * @property {SystemUserRegisterDTO[]|null} data Register items.
 * @property {PaginatedLinks|null} links Pagination links.
 * @property {ItemStreamStats|null} stats Stream statistics.
 */

/**
 * Represents an opaque int64 pagination token.
 *
 * @typedef {Object} Int64Opaque
 * @property {number} value Inner integer value.
 */

/**
 * Represents an access package assigned to a SystemUser.
 *
 * @typedef {Object} AccessPackage
 * @property {string|null} id Access package identifier.
 * @property {string|null} name Access package name.
 */

/**
 * Represents the type of a SystemUser.
 *
 * @typedef {Object} SystemUserType
 * @property {string|null} name System user type name.
 */

/**
 * Represents pagination links.
 *
 * @typedef {Object} PaginatedLinks
 * @property {*} next Next page link.
 * @property {*} previous Previous page link.
 */

/**
 * Represents statistics for an item stream.
 *
 * @typedef {Object} ItemStreamStats
 * @property {number|null} count Number of items.
 */

/**
 * Represents a SystemUser register DTO item.
 *
 * @typedef {Object} SystemUserRegisterDTO
 * @property {string|null} id SystemUser identifier.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} reporteeOrgNo Reportee organisation number.
 * @property {string|null} systemId System identifier.
 */



/**
 * Represents a paginated list of clients available for system user delegation.
 *
 * @typedef {Object} ClientInfoClientInfoPaginated
 * @property {ClientInfo[]|null} data Client information items.
 * @property {PaginatedLinks|null} links Pagination links.
 * @property {SystemUserInfo|null} systemUserInformation System user information.
 */

/**
 * Represents information about a delegation client.
 *
 * @typedef {Object} ClientInfo
 * @property {string} clientId Client identifier.
 * @property {string|null} clientOrganizationNumber Client organisation number.
 * @property {string|null} clientOrganizationName Client organisation name.
 */

/**
 * Represents a delegation between an agent and a client.
 *
 * @typedef {Object} ClientDelegationResponse
 * @property {string} agent Agent system user identifier.
 * @property {string} client Client identifier.
 */

/**
 * Represents a delegation response.
 *
 * @typedef {Object} DelegationResponse
 * @property {string} agentSystemUserId Agent system user identifier.
 * @property {string} delegationId Delegation identifier.
 * @property {string|null} customerId Customer identifier.
 * @property {string|null} assignmentId Assignment identifier.
 * @property {string|null} customerName Customer name.
 */

/**
 * Represents system user information.
 *
 * @typedef {Object} SystemUserInfo
 * @property {string|null} id System user identifier.
 * @property {string|null} partyId Party identifier.
 * @property {string|null} systemId System identifier.
 */


/**
 * @typedef {Object} RegisteredSystemDTO
 * @property {string|null} systemId System identifier.
 * @property {string|null} systemVendorOrgNumber Vendor organization number.
 * @property {string|null} systemVendorOrgName Vendor organization name.
 * @property {Object<string, string>|null} name Localized system names.
 * @property {Object<string, string>|null} description Localized system descriptions.
 * @property {Right[]|null} rights System rights.
 * @property {AccessPackage[]|null} accessPackages System access packages.
 * @property {boolean} isVisible Whether the system is visible.
 */

/**
 * @typedef {Object} RegisteredSystemResponse
 * @property {string|null} id System identifier.
 * @property {VendorInfo|null} vendor Vendor information.
 * @property {Object<string, string>|null} name Localized system names.
 * @property {Object<string, string>|null} description Localized system descriptions.
 * @property {Right[]|null} rights System rights.
 * @property {AccessPackage[]|null} accessPackages System access packages.
 * @property {boolean} isDeleted Whether the system is deleted.
 * @property {string[]|null} clientId Client identifiers.
 * @property {boolean} isVisible Whether the system is visible.
 * @property {string[]|null} allowedRedirectUrls Allowed redirect URLs.
 */

/**
 * @typedef {Object} RegisterSystemRequest
 * @property {string|null} id System identifier.
 * @property {VendorInfo|null} vendor Vendor information.
 * @property {Object<string, string>|null} name Localized system names.
 * @property {Object<string, string>|null} description Localized system descriptions.
 * @property {Right[]|null} rights System rights.
 * @property {AccessPackage[]|null} accessPackages System access packages.
 * @property {string[]|null} clientId Client identifiers.
 * @property {boolean} isVisible Whether the system is visible.
 * @property {string[]|null} allowedRedirectUrls Allowed redirect URLs.
 */

/**
 * @typedef {Object} SystemRegisterUpdateResult
 * @property {boolean} succeeded Whether the update succeeded.
 */

/**
 * @typedef {Object} VendorInfo
 * @property {string|null} ID Vendor identifier.
 */

/**
 * @typedef {Object} Right
 * @property {string|null} action Action identifier.
 * @property {AttributePair[]|null} resource Resource attribute pairs.
 */

/**
 * @typedef {Object} AttributePair
 * @property {string} id Attribute identifier.
 * @property {string} value Attribute value.
 */

/**
 * @typedef {Object} AccessPackage
 * @property {string|null} urn Access package URN.
 */

/**
 * @typedef {Object} SystemChangeLog
 * @property {string|null} systemInternalId Internal system identifier.
 * @property {string|null} changedByOrgNumber Organization number that performed the change.
 * @property {SystemChangeType|null} changeType Type of change performed.
 * @property {*} changedData Changed data payload.
 * @property {string|null} clientId Client identifier associated with the change.
 * @property {string|null} created Timestamp when the change was created.
 */

/**
 * @typedef {"create"|"update"|"rightsupdate"|"accesspackageupdate"|"delete"|"unknown"} SystemChangeType
 * Type of change performed on a registered system.
 */

/**
 * @typedef {Object} CreateRequestSystemUser
 * @property {string|null} externalRef External reference supplied by the vendor.
 * @property {string} systemId Registered system identifier.
 * @property {string} partyOrgNo Customer organization number.
 * @property {Right[]|null} rights Rights requested for the system user.
 * @property {AccessPackage[]|null} accessPackages Access packages requested for the system user.
 * @property {string|null} redirectUrl Redirect URL after request completion.
 */

/**
 * @typedef {Object} CreateAgentRequestSystemUser
 * @property {string|null} externalRef External reference supplied by the vendor.
 * @property {string} systemId Registered system identifier.
 * @property {string} partyOrgNo Customer organization number.
 * @property {AccessPackage[]} accessPackages Access packages requested for the agent system user.
 * @property {string|null} redirectUrl Redirect URL after request completion.
 */

/**
 * @typedef {Object} RequestSystemResponse
 * @property {string} id Request identifier.
 * @property {string|null} externalRef External reference supplied by the vendor.
 * @property {string} systemId Registered system identifier.
 * @property {string} partyOrgNo Customer organization number.
 * @property {Right[]} rights Requested rights.
 * @property {AccessPackage[]} accessPackages Requested access packages.
 * @property {string} status Current request status.
 * @property {string|null} redirectUrl Redirect URL associated with the request.
 * @property {string|null} confirmUrl Confirmation URL associated with the request.
 */

/**
 * @typedef {Object} AgentRequestSystemResponse
 * @property {string} id Request identifier.
 * @property {string|null} externalRef External reference supplied by the vendor.
 * @property {string} systemId Registered system identifier.
 * @property {string} partyOrgNo Customer organization number.
 * @property {AccessPackage[]} accessPackages Requested access packages.
 * @property {string} status Current request status.
 * @property {string|null} redirectUrl Redirect URL associated with the request.
 * @property {string|null} confirmUrl Confirmation URL associated with the request.
 */

/**
 * @typedef {Object} RequestSystemResponsePaginated
 * @property {RequestSystemResponse[]|null} data Paginated request system user responses.
 * @property {PaginatedLinks|null} links Pagination links.
 */

/**
 * @typedef {Object} AgentRequestSystemResponsePaginated
 * @property {AgentRequestSystemResponse[]|null} data Paginated agent request system user responses.
 * @property {PaginatedLinks|null} links Pagination links.
 */

/**
 * Represents an opaque GUID value returned by the API.
 *
 * @typedef {Object} GuidOpaque
 * @property {string|null} value Opaque GUID value.
 */
