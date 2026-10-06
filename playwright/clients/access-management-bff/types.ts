// Typene følger swaggeren til Altinn.AccessManagement.UI, som K6/clients/access-management-bff
// er generert fra. Swaggeren har ingen operationId, så navnene er actionene i controllerne.

export type RevokeRightHolderQuery = {
    // Party UUID til parten kallet gjøres på vegne av.
    party: string;
    // Party UUID tilgangen er gitt fra.
    from: string;
    // Party UUID tilgangen er gitt til.
    to: string;
};

export type GetRightholdersQuery = {
    // Party UUID til parten kallet gjøres på vegne av.
    party: string;
    // Party UUID tilgangen er gitt fra.
    from?: string;
    // Party UUID tilgangen er gitt til.
    to?: string;
};

export type Connection = {
    party: {
        // Party UUID.
        id: string;
        name: string;
        partyId: number;
    };
};

export type AuthorizedParty = {
    partyUuid: string;
    name: string;
    subunits: AuthorizedParty[] | null;
};
