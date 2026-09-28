import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { NotificationSettingsPatchRequest, NotificationSettingsRequest } from "./professional-notification-settings.types.js";

const TAGS = {
    GetNotificationSettings: {
        action: "get-notification-settings",
    },
    CreateOrUpdateNotificationSettings: {
        action: "create-or-update-notification-settings",
    },
    PatchNotificationSettings: {
        action: "patch-notification-settings",
    },
    DeleteNotificationSettings: {
        action: "delete-notification-settings",
    },
    GetAllNotificationSettings: {
        action: "get-all-notification-settings",
    },
};

class ProfessionalNotificationSettingsClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
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
        this.BASE_PATH = "/profile/api/v1/users/current/notificationsettings";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationSettings(partyUuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/parties/${partyUuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
                action: TAGS.GetNotificationSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds or updates notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {NotificationSettingsRequest} request
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateOrUpdateNotificationSettings(
        partyUuid,
        request,
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}/parties/${partyUuid}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
                action: TAGS.CreateOrUpdateNotificationSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Partially updates notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {NotificationSettingsPatchRequest} request
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PatchNotificationSettings(partyUuid, request, labels = null) {
        return http.patch(
            `${this.FULL_PATH}/parties/${partyUuid}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
                action: TAGS.PatchNotificationSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteNotificationSettings(partyUuid, labels = null) {
        return http.del(
            `${this.FULL_PATH}/parties/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
                action: TAGS.DeleteNotificationSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets notification settings for all parties.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAllNotificationSettings(labels = null) {
        return http.get(
            `${this.FULL_PATH}/parties`,
            requestParams({
                endpoint: `${this.FULL_PATH}/parties`,
                action: TAGS.GetAllNotificationSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ProfessionalNotificationSettingsClient };
