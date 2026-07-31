/**
 * Extended broker resource configuration.
 *
 * @typedef {object} ResourceExt
 * @property {number|null} maxFileTransferSize
 * The maximum upload size for the resource, in bytes.
 * @property {string|null} fileTransferTimeToLive
 * Time before a file transfer expires (ISO8601 duration format).
 * @property {boolean|null} purgeFileTransferAfterAllRecipientsConfirmed
 * Whether a file transfer should be deleted after all recipients have confirmed.
 * @property {string|null} purgeFileTransferGracePeriod
 * Grace period before deleting a confirmed file transfer (ISO8601 duration format).
 * @property {boolean|null} useManifestFileShim
 * Whether the manifest file shim should be used for downloaded files.
 * @property {string|null} externalServiceCodeLegacy
 * External service code used by the Altinn 2 broker service.
 * @property {number|null} externalServiceEditionCodeLegacy
 * External service edition code used by the Altinn 2 broker service.
 * @property {boolean|null} requiredParty
 * Whether the service owner party is required as the subject of the file transfer.
 */

export const ResourceExt = undefined;
