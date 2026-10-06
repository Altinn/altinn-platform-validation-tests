// Typene følger app-swaggeren, https://docs.altinn.studio/nb/api/apps/spec/, hentet fra
// /{org}/{app}/swagger/v1/swagger.json. Bare feltene testene bruker er tatt med.

export type SimpleInstance = {
    // {instanceOwnerPartyId}/{instanceGuid}
    id: string;
};
