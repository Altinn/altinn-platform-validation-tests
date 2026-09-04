import http from "k6/http";

import { URL } from "../../../common-imports.js";

const TAGS = {
    GetUserProfile: {
        action: "get-user-profile",
    },
    UpdateShowDeleted: {
        action: "update-show-deleted",
    },
    GetActorListOld: {
        action: "get-actor-list-old",
    },
    GetActorList: {
        action: "get-actor-list",
    },
    GetFavorites: {
        action: "get-favorites",
    },
    CreateFavorite: {
        action: "create-favorite",
    },
    DeleteFavorite: {
        action: "delete-favorite",
    },
    GetReportee: {
        action: "get-reportee",
    },
    GetReporteeList: {
        action: "get-reportee-list",
    },
    GetIsAdmin: {
        action: "get-is-admin",
    },
    GetIsClientAdmin: {
        action: "get-is-client-admin",
    },
    GetIsCompanyProfileAdmin: {
        action: "get-is-company-profile-admin",
    },
    GetIsHovedadmin: {
        action: "get-is-hovedadmin",
    },
    GetIsInstanceAdmin: {
        action: "get-is-instance-admin",
    },
    GetIsMaskinportenAdmin: {
        action: "get-is-maskinporten-admin",
    },
};

/**
 * Client for the user endpoints of the Access Management BFF API.
 */
class UserClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/accessmanagement/api/v1/user";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the profile of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUserProfile(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/profile`);

        let tags = {
            endpoint: `${this.FULL_PATH}/profile`,
            name: `${this.FULL_PATH}/profile`,
            action: TAGS.GetUserProfile.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Updates whether deleted entities are shown for the authenticated user.
     *
     * @param {boolean|null} [body] Whether to show deleted entities.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateShowDeleted(body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/profile/settingspreferences/showdeleted`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/profile/settingspreferences/showdeleted`,
            name: `${this.FULL_PATH}/profile/settingspreferences/showdeleted`,
            action: TAGS.UpdateShowDeleted.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the actor list of the authenticated user in the Altinn 2 format.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActorListOld(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/actorlist/old`);

        let tags = {
            endpoint: `${this.FULL_PATH}/actorlist/old`,
            name: `${this.FULL_PATH}/actorlist/old`,
            action: TAGS.GetActorListOld.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the actor list of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActorList(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/actorlist`);

        let tags = {
            endpoint: `${this.FULL_PATH}/actorlist`,
            name: `${this.FULL_PATH}/actorlist`,
            action: TAGS.GetActorList.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the favourite actors of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFavorites(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/actorlist/favorites`);

        let tags = {
            endpoint: `${this.FULL_PATH}/actorlist/favorites`,
            name: `${this.FULL_PATH}/actorlist/favorites`,
            action: TAGS.GetFavorites.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Adds an actor to the favourites of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the actor.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateFavorite(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/actorlist/favorites/${partyUuid}`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
            name: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
            action: TAGS.CreateFavorite.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Removes an actor from the favourites of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the actor.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteFavorite(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/actorlist/favorites/${partyUuid}`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
            name: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
            action: TAGS.DeleteFavorite.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets a reportee of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReportee(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/reportee/${partyUuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/reportee/{partyUuid}`,
            name: `${this.FULL_PATH}/reportee/{partyUuid}`,
            action: TAGS.GetReportee.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the right holders of a reportee of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReporteeList(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/reporteelist/${partyUuid}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/reporteelist/{partyUuid}`,
            name: `${this.FULL_PATH}/reporteelist/{partyUuid}`,
            action: TAGS.GetReporteeList.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is an administrator for the reportee.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsAdmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isAdmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isAdmin`,
            name: `${this.FULL_PATH}/isAdmin`,
            action: TAGS.GetIsAdmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is a client administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsClientAdmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isClientAdmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isClientAdmin`,
            name: `${this.FULL_PATH}/isClientAdmin`,
            action: TAGS.GetIsClientAdmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is a company profile administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsCompanyProfileAdmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isCompanyProfileAdmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isCompanyProfileAdmin`,
            name: `${this.FULL_PATH}/isCompanyProfileAdmin`,
            action: TAGS.GetIsCompanyProfileAdmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is a main administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsHovedadmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isHovedadmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isHovedadmin`,
            name: `${this.FULL_PATH}/isHovedadmin`,
            action: TAGS.GetIsHovedadmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is an instance administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsInstanceAdmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isInstanceAdmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isInstanceAdmin`,
            name: `${this.FULL_PATH}/isInstanceAdmin`,
            action: TAGS.GetIsInstanceAdmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Checks whether the authenticated user is a Maskinporten administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsMaskinportenAdmin(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/isMaskinportenAdmin`);
        url.searchParams.append("party", party);

        let tags = {
            endpoint: `${this.FULL_PATH}/isMaskinportenAdmin`,
            name: `${this.FULL_PATH}/isMaskinportenAdmin`,
            action: TAGS.GetIsMaskinportenAdmin.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { UserClient };
