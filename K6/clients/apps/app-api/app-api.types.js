/**
 * @typedef {object} ProcessNext
 * @property {string|null} [action]
 * @property {string|null} [actionOnBehalfOf]
 */

/**
 * @typedef {0|1} ActionType
 */

/**
 * @typedef {object} UserAction
 * @property {string|null} id
 * @property {boolean} [authorized]
 * @property {ActionType} [type]
 */

/**
 * @typedef {object} AppProcessElementInfo
 * @property {number|null} [flow]
 * @property {string|null} [started]
 * @property {string|null} [elementId]
 * @property {string|null} [name]
 * @property {string|null} [altinnTaskType]
 * @property {string|null} [ended]
 * @property {import("../../storage/instances.types.js").ValidationStatus} [validated]
 * @property {string|null} [flowType]
 * @property {{[key: string]: boolean}|null} [actions]
 * @property {Array<UserAction>|null} [userActions]
 * @property {boolean} [read]
 * @property {boolean} [write]
 * @property {string|null} [elementType]
 */

/**
 * @typedef {object} AppProcessTaskTypeInfo
 * @property {string|null} [altinnTaskType]
 * @property {string|null} [elementId]
 * @property {string|null} [elementType]
 */

/**
 * @typedef {object} AppProcessState
 * @property {string|null} [started]
 * @property {string|null} [startEvent]
 * @property {AppProcessElementInfo} [currentTask]
 * @property {string|null} [ended]
 * @property {string|null} [endEvent]
 * @property {Array<AppProcessTaskTypeInfo>|null} [processTasks]
 */

export const ProcessNext = undefined;
export const ActionType = undefined;
export const UserAction = undefined;
export const AppProcessElementInfo = undefined;
export const AppProcessTaskTypeInfo = undefined;
export const AppProcessState = undefined;
