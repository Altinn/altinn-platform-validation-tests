import http from "k6/http";

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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
            name: `${this.FULL_PATH}/parties/{partyUuid}`,
            action: TAGS.GetNotificationSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
            name: `${this.FULL_PATH}/parties/{partyUuid}`,
            action: TAGS.CreateOrUpdateNotificationSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
            name: `${this.FULL_PATH}/parties/{partyUuid}`,
            action: TAGS.PatchNotificationSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.patch(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/parties/{partyUuid}`,
            name: `${this.FULL_PATH}/parties/{partyUuid}`,
            action: TAGS.DeleteNotificationSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets notification settings for all parties.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAllNotificationSettings(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetAllNotificationSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { ProfessionalNotificationSettingsClient };
