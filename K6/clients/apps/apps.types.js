/**
 * Alternate ways to specify the instance owner. Only one of these should be set.
 *
 * @typedef {object} InstanceWriteOwner
 * @property {string|null} [partyId]
 * @property {string|null} [personNumber]
 * @property {string|null} [organisationNumber]
 * @property {string|null} [username] Not supported by the apps yet, see app-lib-dotnet#652.
 */

/**
 * @typedef {object} InstanceWrite
 * @property {InstanceWriteOwner} instanceOwner
 * @property {string} [dueBefore]
 * @property {string} [visibleAfter]
 */

/**
 * @typedef {object} ProcessNext
 * @property {string|null} [action]
 * @property {string|null} [actionOnBehalfOf]
 */

/**
 * @typedef {object} ProcessElementInfo
 * @property {number|null} [flow]
 * @property {string|null} [started]
 * @property {string|null} [elementId]
 * @property {string|null} [name]
 * @property {string|null} [altinnTaskType]
 * @property {string|null} [ended]
 * @property {object} [validated]
 * @property {string|null} [flowType]
 */

/**
 * @typedef {object} AppProcessState
 * @property {string|null} [started]
 * @property {string|null} [startEvent]
 * @property {ProcessElementInfo} [currentTask]
 * @property {string|null} [ended]
 * @property {string|null} [endEvent]
 * @property {{[key: string]: boolean}|null} [actions]
 */

export const InstanceWriteOwner = undefined;
export const InstanceWrite = undefined;
export const ProcessNext = undefined;
export const ProcessElementInfo = undefined;
export const AppProcessState = undefined;
