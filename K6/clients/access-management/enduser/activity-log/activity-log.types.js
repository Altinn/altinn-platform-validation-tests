/**
 * @typedef {"connections"|"request"|"maskinporten"} ActivityLogArea
 */

/**
 * @typedef {"From"|"To"|"Via"} ActivityLogDirection
 */

/**
 * @typedef {"Assignment"|"Delegation"|"Request"} ActivityLogType
 */

/**
 * @typedef {"Package"|"Resource"|"Instance"} ActivityLogSubtype
 */

/**
 * @typedef {"Created"|"Updated"|"Deleted"} ActivityLogTrigger
 */

/**
 * @typedef {"None"|"Draft"|"Pending"|"Approved"|"Rejected"|"Withdrawn"} ActivityLogRequestStatus
 */

/**
 * @typedef {"From"|"To"|"Via"|"By"|"Role"|"Package"|"Resource"|"Source"|"ActivityType"} ActivityLogFilterField
 */

/**
 * @typedef {"Name"|"When"} ActivityLogFilterValueOrder
 */

/**
 * @typedef {object} ActivityLogQuery
 * @property {string} party Party UUID. Required.
 * @property {ActivityLogDirection|null} [direction] Required by the API in
 * practice, although the Swagger marks it optional.
 * @property {Array<string>|null} [typeId] Activity type UUIDs.
 * @property {Array<ActivityLogType>|null} [type]
 * @property {Array<ActivityLogSubtype>|null} [subtype]
 * @property {Array<ActivityLogTrigger>|null} [trigger]
 * @property {Array<ActivityLogRequestStatus>|null} [status]
 * @property {Array<string>|null} [by] Party UUIDs.
 * @property {Array<string>|null} [source] UUIDs.
 * @property {Array<string>|null} [operation]
 * @property {Array<string>|null} [from] Party UUIDs.
 * @property {Array<string>|null} [to] Party UUIDs.
 * @property {Array<string>|null} [via] Party UUIDs.
 * @property {Array<string>|null} [role] Role UUIDs.
 * @property {Array<string>|null} [package] Access package UUIDs.
 * @property {Array<string>|null} [resource] Resource UUIDs.
 * @property {Array<string>|null} [instance]
 * @property {Array<string>|null} [itemId] UUIDs.
 * @property {Array<string>|null} [parentId] UUIDs.
 * @property {string|null} [after] ISO date-time.
 * @property {string|null} [before] ISO date-time.
 * @property {number|null} [pageSize]
 * @property {number|null} [pageNo]
 */

/**
 * @typedef {ActivityLogQuery & {term?: string|null, orderBy?: ActivityLogFilterValueOrder|null}} ActivityLogFilterValuesQuery
 */

/**
 * @typedef {object} ActivityLogDto
 * @property {string} id UUID.
 * @property {ActivityLogType} type
 * @property {ActivityLogSubtype|null} subtype
 * @property {ActivityLogTrigger} trigger
 * @property {ActivityLogRequestStatus|null} status
 * @property {string} when ISO date-time.
 * @property {string|null} byId UUID.
 * @property {string|null} byName
 * @property {string|null} sourceId UUID.
 * @property {string|null} sourceName
 * @property {string|null} operationId
 * @property {string|null} fromId UUID.
 * @property {string|null} fromName
 * @property {string|null} fromType
 * @property {string|null} toId UUID.
 * @property {string|null} toName
 * @property {string|null} toType
 * @property {string|null} viaId UUID.
 * @property {string|null} viaName
 * @property {string|null} viaType
 * @property {string|null} roleId UUID.
 * @property {string|null} roleName
 * @property {string|null} packageId UUID.
 */

/**
 * @typedef {object} PaginatedResultLinks
 * @property {string|null} next
 */

/**
 * @typedef {object} ActivityLogDtoPaginatedResult
 * @property {Array<ActivityLogDto>|null} data
 * @property {PaginatedResultLinks|null} links
 */

/**
 * @typedef {object} ActivityLogFilterValueDto
 * @property {string} id UUID.
 * @property {string|null} name
 */

/**
 * @typedef {object} ActivityLogFilterValueDtoPaginatedResult
 * @property {Array<ActivityLogFilterValueDto>|null} data
 * @property {PaginatedResultLinks|null} links
 */

/**
 * @typedef {object} ActivityTypeDto
 * @property {string} id UUID.
 * @property {ActivityLogType} type
 * @property {ActivityLogSubtype|null} subtype
 * @property {ActivityLogTrigger} trigger
 * @property {ActivityLogRequestStatus|null} status
 * @property {string|null} name
 * @property {string|null} description
 */

/**
 * The three parts of the enduser API that each have their own activity log.
 *
 * @type {{CONNECTIONS: ActivityLogArea, REQUEST: ActivityLogArea, MASKINPORTEN: ActivityLogArea}}
 */
export const ActivityLogArea = {
    CONNECTIONS: "connections",
    REQUEST: "request",
    MASKINPORTEN: "maskinporten",
};

/**
 * The fields the activity log can list filter values for, as returned by
 * `GET /activitylog/filter/fields`.
 *
 * @type {Array<ActivityLogFilterField>}
 */
export const ActivityLogFilterFields = [
    "From",
    "To",
    "Via",
    "By",
    "Role",
    "Package",
    "Resource",
    "Source",
    "ActivityType",
];

export const ActivityLogDirection = undefined;
export const ActivityLogFilterField = undefined;
export const ActivityLogFilterValueOrder = undefined;
export const ActivityLogType = undefined;
export const ActivityLogQuery = undefined;
export const ActivityLogFilterValuesQuery = undefined;
export const ActivityLogDtoPaginatedResult = undefined;
export const ActivityLogFilterValueDtoPaginatedResult = undefined;
export const ActivityTypeDto = undefined;
