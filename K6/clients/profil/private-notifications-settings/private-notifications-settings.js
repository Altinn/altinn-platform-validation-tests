import http from "k6/http";

const TAGS = {
    UpdatePrivateNotificationPhoneNumber: {
        action: "update-private-notification-phone-number",
    },
};

class PrivateNotificationsSettingsClient {
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
        this.BASE_PATH = "/users/current/notificationsettings/private";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Add or update the telephone number for the current user.
     *
     * @param {PrivateNotificationSettingsUpdateRequest} request
     * Request body. Prefer using
     * {@link PrivateNotificationSettingsUpdateRequestBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    UpdatePrivateNotificationPhoneNumber(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/phonenumber`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.UpdatePrivateNotificationPhoneNumber.action,
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
}

export { PrivateNotificationsSettingsClient };
