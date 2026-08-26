import http from "k6/http";

import { GroupRequest } from "./party-groups.types.js";

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
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves a party group.
     *
     * @param {number} groupId See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a party group.
     *
     * @param {GroupRequest} request See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Updates a party group.
     *
     * @param {number} groupId See the client method.
     * @param {GroupRequest} request See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes a party group.
     *
     * @param {number} groupId See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Adds a party to a group.
     *
     * @param {number} groupId See the client method.
     * @param {string} partyUuid See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Removes a party from a group.
     *
     * @param {number} groupId See the client method.
     * @param {string} partyUuid See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }
}

export { PartyGroupsClient };
