export const DigDirScopes = {
    DIALOGPORTEN: {
        NOCONSENT: "digdir:dialogporten.noconsent"
    }
};

export const AltinnScopes = {
    APPDEPLOY: "altinn:appdeploy",

    ENDUSER: {
        DEFAULT: "altinn:enduser",

        CONSENTREQUESTS: {
            READ: "altinn:enduser/consentrequests.read",
            WRITE: "altinn:enduser/consentrequests.write"
        }
    },

    ENDUSERNOCONSENT: "altinn:endusernoconsent",

    BROKER: {
        READ: "altinn:broker.read",
        WRITE: "altinn:broker.write"
    },

    BROKERSERVICE: {
        READ: "altinn:brokerservice.read",
        WRITE: "altinn:brokerservice.write"
    },

    ENTERPRISEBROKERSERVICE: "altinn:enterprisebrokerservice",

    CONSENTREQUESTS: {
        READ: "altinn:consentrequests.read",
        WRITE: "altinn:consentrequests.write"
    },

    CONSENTTOKENS: {
        READ: "altinn:consenttokens.read",
        WRITE: "altinn:consenttokens.write"
    },

    CONSENTTOKENS: "altinn:consenttokens",

    CORRESPONDENCE: {
        READ: "altinn:correspondence.read",
        WRITE: "altinn:correspondence.write"
    },

    DELEGATIONREQUESTS: {
        READ: "altinn:delegationrequests.read",
        WRITE: "altinn:delegationrequests.write"
    },

    ENTERPRISEUSERS: {
        READ: "altinn:enterpriseusers.read",
        WRITE: "altinn:enterpriseusers.write"
    },

    AUTHENTICATION: {
        SYSTEMREGISTER: {
            WRITE: "altinn:authentication/systemregister.write",
            READ: "altinn:authentication/systemregister.read",
            ADMIN: "altinn:authentication/systemregister.admin"
        },

        SYSTEMUSER: {
            REQUEST: {
                READ: "altinn:authentication/systemuser.request.read",
                WRITE: "altinn:authentication/systemuser.request.write"
            }
        }
    },

    ACCESSMANAGEMENT: {
        ENDUSER: {
            REQUESTS: {
                WRITE: "altinn:accessmanagement/enduser:requests.write"
            }
        },

        AUTHORIZEDPARTIES: {
            RESOURCEOWNER: "altinn:accessmanagement/authorizedparties.resourceowner",
            ADMIN: "altinn:accessmanagement/authorizedparties.admin"
        }
    },

    AUTHORIZATION: {
        AUTHORIZE: "altinn:authorization/authorize",
        ADMIN: "altinn:authorization/authorize.admin",

        ROLESANDRIGHTS: {
            READ: "altinn:rolesandrights.read",
            WRITE: "altinn:rolesandrights.write"
        },

        ROLEDEFINITIONS: {
            READ: "altinn:roledefinitions.read",
            WRITE: "altinn:roledefinitions.write"
        },

        DELEGATIONS: {
            READ: "altinn:delegations.read",
            WRITE: "altinn:delegations.write"
        }
    },
    MASKINPORTEN: {
        DELEGATIONS: {
            DEFAULT: "altinn:maskinporten/delegations",
            ADMIN: "altinn:maskinporten/delegations.admin"
        },

        DELEGATIONSCHEMES: {
            READ: "altinn:maskinporten/delegationschemes.read",
            WRITE: "altinn:maskinporten/delegationschemes.write",
            EDIT: "altinn:maskinporten/delegationschemes.edit",
            DELETE: "altinn:maskinporten/delegationschemes.delete",
            ADMIN: "altinn:maskinporten/delegationschemes.admin"
        },

        CONSENT: {
            READ: "altinn:maskinporten/consent.read"
        }
    },

    PORTAL: {
        ENDUSER: "altinn:portal/enduser"
    },

    PDP: {
        AUTHORIZE: {
            ENDUSER: "altinn:pdp/authorize.enduser"
        }
    },

    PROFILES: {
        READ: "altinn:profiles.read",
        WRITE: "altinn:profiles.write"
    },

    LOOKUP: "altinn:lookup",

    REPORTEES: "altinn:reportees",

    INSTANCES: {
        META: "altinn:instances.meta",
        READ: "altinn:instances.read",
        WRITE: "altinn:instances.write"
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

    REGISTER: {
        PARTYLOOKUP: {
            ADMIN: "altinn:register/partylookup.admin"
        }
    },

    RESOURCEREGISTRY: {
        RESOURCE: {
            READ: "altinn:resourceregistry/resource.read",
            WRITE: "altinn:resourceregistry/resource.write",
            ADMIN: "altinn:resourceregistry/resource.admin"
        }
    },

    SERVICEOWNER: {
        DEFAULT: "altinn:serviceowner",

        ORGANIZATIONS: "altinn:serviceowner/organizations",

        REPORTEES: "altinn:serviceowner/reportees",

        ROLESANDRIGHTS: "altinn:serviceowner/rolesandrights",

        EVENTS: "altinn:serviceowner/events",

        SRR: {
            READ: "altinn:serviceowner/srr.read",
            WRITE: "altinn:serviceowner/srr.write"
        },

        CONSENTS: "altinn:serviceowner/consents",

        DELEGATIONREQUESTS: {
            READ: "altinn:serviceowner/delegationrequests.read",
            WRITE: "altinn:serviceowner/delegationrequests.write"
        },

        DELEGATIONS: {
            WRITE: "altinn:serviceowner/delegations.write"
        },

        INSTANCES: {
            READ: "altinn:serviceowner/instances.read",
            WRITE: "altinn:serviceowner/instances.write"
        },

        NOTIFICATIONS: {
            READ: "altinn:serviceowner/notifications.read",
            CREATE: "altinn:serviceowner/notifications.create"
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
