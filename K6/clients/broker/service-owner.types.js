/**
 * Represents the Broker properties used to initialize a service owner.
 *
 * @typedef {object} ServiceOwnerInitializeExt
 * @property {string|null} name The name of the service owner.
 */

/**
 * Represents the Broker properties of a service owner.
 *
 * @typedef {object} ServiceOwnerOverviewExt
 * @property {string|null} name The name of the service owner.
 * @property {Array<StorageProviderExt>|null} storageProviders The service owner's storage providers.
 */

/**
 * Represents the Broker properties of a storage provider.
 *
 * @typedef {object} StorageProviderExt
 * @property {StorageProviderTypeExt} type The type of storage provider.
 * @property {DeploymentStatusExt} deploymentStatus The deployment status of the storage provider.
 * @property {string|null} deploymentEnvironment The deployment environment of the storage provider.
 */

/**
 * Represents the storage provider type.
 *
 * @typedef {"AltinnAzure"|"AltinnAzureWithoutVirusScan"} StorageProviderTypeExt
 */

/**
 * Represents the deployment status of Azure resources for storage providers.
 *
 * @typedef {"NotStarted"|"DeployingResources"|"Ready"} DeploymentStatusExt
 */

export const ServiceOwnerInitializeExt = undefined;
export const ServiceOwnerOverviewExt = undefined;
export const StorageProviderExt = undefined;
export const StorageProviderTypeExt = undefined;
export const DeploymentStatusExt = undefined;
