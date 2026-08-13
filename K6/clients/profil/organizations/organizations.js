import http from "k6/http";

const TAGS = {
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    CreateNotificationAddress: {
        action: "create-notification-address",
    },
    GetNotificationAddress: {
        action: "get-notification-address",
    },
    UpdateNotificationAddress: {
        action: "update-notification-address",
    },
    DeleteNotificationAddress: {
        action: "delete-notification-address",
    },
};

class OrganizationsClient {
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
        this.BASE_PATH = "/profile/api/v1/organizations";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets notification addresses for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetNotificationAddresses(organizationNumber, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
            name: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
            action: TAGS.GetNotificationAddresses.action,
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
     * Creates a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {NotificationAddressRequest} request Notification address request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateNotificationAddress(
        organizationNumber,
        request,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
            name: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
            action: TAGS.CreateNotificationAddress.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets a specific notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetNotificationAddress(
        organizationNumber,
        notificationAddressId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            name: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            action: TAGS.GetNotificationAddress.action,
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
     * Updates a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {NotificationAddressRequest} request Notification address request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateNotificationAddress(
        organizationNumber,
        notificationAddressId,
        request,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            name: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            action: TAGS.UpdateNotificationAddress.action,
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
     * Deletes a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteNotificationAddress(
        organizationNumber,
        notificationAddressId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            name: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
            action: TAGS.DeleteNotificationAddress.action,
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
}

export { OrganizationsClient };
