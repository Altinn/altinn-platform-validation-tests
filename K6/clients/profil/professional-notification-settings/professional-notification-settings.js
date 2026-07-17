import http from "k6/http";

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
        this.BASE_PATH = "/users/current/notificationsettings";

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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetNotificationSettings(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Adds or updates notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {NotificationSettingsRequest} request
     * Request body.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    CreateOrUpdateNotificationSettings(
        partyUuid,
        request,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Partially updates notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {NotificationSettingsPatchRequest} request
     * Request body.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    PatchNotificationSettings(partyUuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Deletes notification settings for a party.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    DeleteNotificationSettings(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/parties/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Gets notification settings for all parties.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
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
            },
        });
    }
}

export { ProfessionalNotificationSettingsClient };
