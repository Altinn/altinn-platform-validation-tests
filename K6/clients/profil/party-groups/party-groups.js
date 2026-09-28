import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
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
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetPartyGroups.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves a party group.
     *
     * @param {number} groupId See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPartyGroup(groupId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${groupId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{groupId}`,
                action: TAGS.GetPartyGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a party group.
     *
     * @param {GroupRequest} request See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreatePartyGroup(request, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.CreatePartyGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
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
        return http.patch(
            `${this.FULL_PATH}/${groupId}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/{groupId}`,
                action: TAGS.UpdatePartyGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes a party group.
     *
     * @param {number} groupId See the client method.
     * @param {{[key: string]: string}|null} [labels] See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeletePartyGroup(groupId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${groupId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{groupId}`,
                action: TAGS.DeletePartyGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.put(
            `${this.FULL_PATH}/${groupId}/associations/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{groupId}/associations/{partyUuid}`,
                action: TAGS.AddPartyToGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.del(
            `${this.FULL_PATH}/${groupId}/associations/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{groupId}/associations/{partyUuid}`,
                action: TAGS.RemovePartyFromGroup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { PartyGroupsClient };
