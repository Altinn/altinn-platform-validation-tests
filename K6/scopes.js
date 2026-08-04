export const DigDirScopes = {
    DIALOGPORTEN: {
        DEFAULT: "digdir:dialogporten",

        NOCONSENT: "digdir:dialogporten.noconsent",

        SERVICEPROVIDER: {
            DEFAULT: "digdir:dialogporten.serviceprovider",

            CHANGFETRANSMISSIONS: "digdir:dialogporten.serviceprovider.changetransmissions",
            CORRESPONDENCE: "digdir:dialogporten.serviceprovider.correspondence",
            SEARCH: "digdir:dialogporten.serviceprovider.search"
        }
    }
};

export const AltinnScopes = {
    ACCESSMANAGEMENT: {
        AUTHORIZEDPARTIES: {
            ADMIN: "altinn:accessmanagement/authorizedparties.admin",
            RESOURCEOWNER: "altinn:accessmanagement/authorizedparties.resourceowner"
        },

        ENDUSER: {
            REQUESTS: {
                WRITE: "altinn:accessmanagement/enduser:requests.write"
            }
        }
    },

    APPDEPLOY: "altinn:appdeploy",

    AUTHENTICATION: {
        SYSTEMREGISTER: {
            ADMIN: "altinn:authentication/systemregister.admin",
            READ: "altinn:authentication/systemregister.read",
            WRITE: "altinn:authentication/systemregister.write"
        },

        SYSTEMUSER: {
            REQUEST: {
                READ: "altinn:authentication/systemuser.request.read",
                WRITE: "altinn:authentication/systemuser.request.write"
            }
        }
    },

    AUTHORIZATION: {
        ADMIN: "altinn:authorization/authorize.admin",
        AUTHORIZE: "altinn:authorization/authorize",

        DELEGATIONS: {
            READ: "altinn:delegations.read",
            WRITE: "altinn:delegations.write"
        },

        ROLEDEFINITIONS: {
            READ: "altinn:roledefinitions.read",
            WRITE: "altinn:roledefinitions.write"
        },

        ROLESANDRIGHTS: {
            READ: "altinn:rolesandrights.read",
            WRITE: "altinn:rolesandrights.write"
        }
    },

    BROKER: {
        READ: "altinn:broker.read",
        WRITE: "altinn:broker.write"
    },

    BROKERSERVICE: {
        READ: "altinn:brokerservice.read",
        WRITE: "altinn:brokerservice.write"
    },

    CONSENTREQUESTS: {
        READ: "altinn:consentrequests.read",
        WRITE: "altinn:consentrequests.write"
    },

    CONSENTTOKENS: {
        DEFAULT: "altinn:consenttokens",

        READ: "altinn:consenttokens.read",
        WRITE: "altinn:consenttokens.write"
    },

    CORRESPONDENCE: {
        READ: "altinn:correspondence.read",
        WRITE: "altinn:correspondence.write"
    },

    DATAALTINNNO: {
        DEFAULT: "altinn:dataaltinnno",

        ADVREGBULK: "altinn:dataaltinnno/advregbulk",
        ADVREGPERSON: "altinn:dataaltinnno/advregperson",
        ADVREGVERIFIKASJON: "altinn:dataaltinnno/advregverifikasjon",
        DIHE: "altinn:dataaltinnno/dihe",
        EBEVIS: "altinn:dataaltinnno/ebevis",
        OED: "altinn:dataaltinnno/oed",
        REELLE: "altinn:dataaltinnno/reelle",
        TILDA: "altinn:dataaltinnno/tilda"
    },

    DELEGATIONREQUESTS: {
        READ: "altinn:delegationrequests.read",
        WRITE: "altinn:delegationrequests.write"
    },

    ENDUSER: {
        DEFAULT: "altinn:enduser",

        CONSENTREQUESTS: {
            READ: "altinn:enduser/consentrequests.read",
            WRITE: "altinn:enduser/consentrequests.write"
        }
    },

    ENDUSERNOCONSENT: "altinn:endusernoconsent",

    ENTERPRISEBROKERSERVICE: "altinn:enterprisebrokerservice",

    ENTERPRISEUSERS: {
        READ: "altinn:enterpriseusers.read",
        WRITE: "altinn:enterpriseusers.write"
    },

    INSTANCES: {
        META: "altinn:instances.meta",
        READ: "altinn:instances.read",
        WRITE: "altinn:instances.write"
    },

    LOOKUP: "altinn:lookup",

    MASKINPORTEN: {
        CONSENT: {
            READ: "altinn:maskinporten/consent.read"
        },

        DELEGATIONS: {
            DEFAULT: "altinn:maskinporten/delegations",

            ADMIN: "altinn:maskinporten/delegations.admin"
        },

        DELEGATIONSCHEMES: {
            ADMIN: "altinn:maskinporten/delegationschemes.admin",
            DELETE: "altinn:maskinporten/delegationschemes.delete",
            EDIT: "altinn:maskinporten/delegationschemes.edit",
            READ: "altinn:maskinporten/delegationschemes.read",
            WRITE: "altinn:maskinporten/delegationschemes.write"
        }
    },

    PDP: {
        AUTHORIZE: {
            ENDUSER: "altinn:pdp/authorize.enduser"
        }
    },

    PORTAL: {
        ENDUSER: "altinn:portal/enduser"
    },

    PROFILES: {
        READ: "altinn:profiles.read",
        WRITE: "altinn:profiles.write"
    },

    REGISTER: {
        PARTYLOOKUP: {
            ADMIN: "altinn:register/partylookup.admin"
        }
    },

    REPORTEES: "altinn:reportees",

    RESOURCEREGISTRY: {
        RESOURCE: {
            ADMIN: "altinn:resourceregistry/resource.admin",
            READ: "altinn:resourceregistry/resource.read",
            WRITE: "altinn:resourceregistry/resource.write"
        }
    },

    SERVICEOWNER: {
        DEFAULT: "altinn:serviceowner",

        CONSENTS: "altinn:serviceowner/consents",

        DELEGATIONREQUESTS: {
            READ: "altinn:serviceowner/delegationrequests.read",
            WRITE: "altinn:serviceowner/delegationrequests.write"
        },

        DELEGATIONS: {
            WRITE: "altinn:serviceowner/delegations.write"
        },

        EVENTS: "altinn:serviceowner/events",

        INSTANCES: {
            READ: "altinn:serviceowner/instances.read",
            WRITE: "altinn:serviceowner/instances.write"
        },

        NOTIFICATIONS: {
            CREATE: "altinn:serviceowner/notifications.create",
            READ: "altinn:serviceowner/notifications.read"
        },

        ORGANIZATIONS: "altinn:serviceowner/organizations",

        REPORTEES: "altinn:serviceowner/reportees",

        ROLESANDRIGHTS: "altinn:serviceowner/rolesandrights",

        SRR: {
            READ: "altinn:serviceowner/srr.read",
            WRITE: "altinn:serviceowner/srr.write"
        }
    },

    SYSTEM: {
        NOTIFICATIONS: {
            CONDITION: {
                CHECK: "altinn:system/notifications.condition.check"
            }
        }
    }
};

/**
 * Creates an OAuth scope string from an array of scopes.
 *
 * Empty, null, or undefined values are ignored.
 *
 * @param {(string | null | undefined)[]} scopes - The scopes to include.
 * @returns {string} A space-delimited scope string suitable for OAuth requests.
 * @example
 * const scopes = CreateScopeString([
 *    AltinnScopes.ACCESSMANAGEMENT.ENDUSER.REQUESTS.WRITE,
 *    AltinnScopes.CONSENTREQUESTS.READ,
 *    AltinnScopes.CONSENTREQUESTS.WRITE
 * ]);
 *
 * // Returns:
 * // "altinn:accessmanagement/enduser:requests.write altinn:consentrequests.read altinn:consentrequests.write"
 */
export function CreateScopeString(scopes) {
    return scopes.filter(Boolean).join(" ");
}
