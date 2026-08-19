import http from "k6/http";

const TAGS = {
    UpdateSelectedLanguage: {
        action: "update-selected-language",
    },
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    CreateNotificationAddress: {
        action: "create-notification-address",
    },
    DeleteNotificationAddress: {
        action: "delete-notification-address",
    },
    UpdateNotificationAddress: {
        action: "update-notification-address",
    },
};

/**
 * Client for the settings endpoints of the Access Management BFF API.
 */
class SettingsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/settings";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Updates the language of the authenticated user.
     *
     * @param {SettingsControllerUpdateSelectedLanguageRequest|null} [body] The
     * language to select. Prefer using
     * {@link SettingsControllerUpdateSelectedLanguageRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateSelectedLanguage(body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/language/selectedLanguage`);

        let tags = {
            endpoint: `${this.FULL_PATH}/language/selectedLanguage`,
            name: `${this.FULL_PATH}/language/selectedLanguage`,
            action: TAGS.UpdateSelectedLanguage.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
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
     * Gets the notification addresses of an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetNotificationAddresses(orgNumber, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
            name: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
            action: TAGS.GetNotificationAddresses.action,
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
     * Adds a notification address to an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {NotificationAddressModel|null} [body] The notification address to
     * add. Prefer using {@link NotificationAddressModelBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateNotificationAddress(orgNumber, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
            name: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
            action: TAGS.CreateNotificationAddress.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
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
     * Removes a notification address from an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {number} notificationAddressId Notification address id.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteNotificationAddress(
        orgNumber,
        notificationAddressId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
            name: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
            action: TAGS.DeleteNotificationAddress.action,
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
     * Updates a notification address of an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {number} notificationAddressId Notification address id.
     * @param {NotificationAddressModel|null} [body] The new notification address
     * values. Prefer using {@link NotificationAddressModelBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateNotificationAddress(
        orgNumber,
        notificationAddressId,
        body = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
            name: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
            action: TAGS.UpdateNotificationAddress.action,
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
}

export { SettingsClient };
