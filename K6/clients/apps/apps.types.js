/**
 * @typedef {object} InstanceOwner
 * @property {string|null} [partyId]
 * @property {string|null} [personNumber]
 * @property {string|null} [organisationNumber]
 * @property {string|null} [username]
 */

/**
 * @typedef {object} InstansiationInstance
 * @property {InstanceOwner} instanceOwner
 * @property {string|null} [dueBefore]
 * @property {string|null} [visibleAfter]
 * @property {{[key: string]: string}|null} [prefill]
 * @property {string|null} [sourceInstanceId]
 */

/**
 * @typedef {object} AppProcessState
 * @property {string|null} [started]
 * @property {string|null} [startEvent]
 * @property {import("../storage/instances.types.js").ProcessElementInfo|null} [currentTask]
 * @property {string|null} [ended]
 * @property {string|null} [endEvent]
 */

export const AppProcessState = undefined;
export const InstanceOwner = undefined;
export const InstansiationInstance = undefined;
