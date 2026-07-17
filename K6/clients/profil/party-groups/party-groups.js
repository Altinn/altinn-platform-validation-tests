import http from "k6/http";

const TAGS = {
    GetPartyGroups: {
        action: "get-party-groups",
    },
    GetPartyGroup: {
        action: "get-party-group",
    },
    CreatePartyGroup: {
        action: "create-party-group",
    },
    UpdatePartyGroup: {
        action: "update-party-group",
    },
    DeletePartyGroup: {
        action: "delete-party-group",
    },
    AddPartyToGroup: {
        action: "add-party-to-group",
    },
    RemovePartyFromGroup: {
        action: "remove-party-from-group",
    },
};

class PartyGroupsClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        this.tokenGenerator = tokenGenerator;

        this.BASE_PATH = "/profile/api/v1/users/current/party-groups";

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves all party groups for the current user.
     *
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    GetPartyGroups(labels = null) {
        const token = this.tokenGenerator.getToken();

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetPartyGroups.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(this.FULL_PATH, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Retrieves a party group.
     *
     * @param {number} groupId
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    GetPartyGroup(groupId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const endpoint = `${this.FULL_PATH}/${groupId}`;

        let tags = {
            endpoint,
            name: endpoint,
            action: TAGS.GetPartyGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(endpoint, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Creates a party group.
     *
     * @param {GroupRequest} request
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    CreatePartyGroup(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.CreatePartyGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(this.FULL_PATH, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Updates a party group.
     *
     * @param {number} groupId
     * @param {GroupRequest} request
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    UpdatePartyGroup(groupId, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const endpoint = `${this.FULL_PATH}/${groupId}`;

        let tags = {
            endpoint,
            name: endpoint,
            action: TAGS.UpdatePartyGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.patch(endpoint, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Deletes a party group.
     *
     * @param {number} groupId
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    DeletePartyGroup(groupId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const endpoint = `${this.FULL_PATH}/${groupId}`;

        let tags = {
            endpoint,
            name: endpoint,
            action: TAGS.DeletePartyGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(endpoint, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Adds a party to a group.
     *
     * @param {number} groupId
     * @param {string} partyUuid
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    AddPartyToGroup(groupId, partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const endpoint = `${this.FULL_PATH}/${groupId}/associations/${partyUuid}`;

        let tags = {
            endpoint,
            name: endpoint,
            action: TAGS.AddPartyToGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(endpoint, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Removes a party from a group.
     *
     * @param {number} groupId
     * @param {string} partyUuid
     * @param {{[key: string]: string}} [labels]
     * @returns {http.RefinedResponse}
     */
    RemovePartyFromGroup(groupId, partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const endpoint = `${this.FULL_PATH}/${groupId}/associations/${partyUuid}`;

        let tags = {
            endpoint,
            name: endpoint,
            action: TAGS.RemovePartyFromGroup.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(endpoint, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export { PartyGroupsClient };
