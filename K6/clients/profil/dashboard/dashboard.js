import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    GetNotificationAddressesByEmail: {
        action: "get-notification-addresses-by-email",
    },
    GetNotificationAddressesByPhoneNumber: {
        action: "get-notification-addresses-by-phone-number",
    },
};

class DashboardClient {
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
        this.BASE_PATH = "/profile/api/v1/dashboard";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets all notification addresses for the given organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddresses(organizationNumber, labels = null) {
        return http.get(
            `${this.FULL_PATH}/organizations/${organizationNumber}/notificationaddresses`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/{organizationNumber}/notificationaddresses`,
                action: TAGS.GetNotificationAddresses.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets all notification addresses for the given email address.
     *
     * @param {string} emailAddress Email address.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddressesByEmail(emailAddress, labels = null) {
        return http.get(
            `${this.FULL_PATH}/organizations/notificationaddresses/email`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/notificationaddresses/email`,
                action: TAGS.GetNotificationAddressesByEmail.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { emailAddress },
            }),
        );
    }

    /**
     * Gets all notification addresses for the given phone number.
     *
     * @param {string} phoneNumber Phone number.
     * @param {{countrycode?: string}|null} [query]
     * Optional country code, sent as an HTTP header by this endpoint.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddressesByPhoneNumber(
        phoneNumber,
        query = null,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/organizations/notificationaddresses/phonenumber`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/notificationaddresses/phonenumber`,
                action: TAGS.GetNotificationAddressesByPhoneNumber.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { phoneNumber, countrycode: query?.countrycode },
            }),
        );
    }

}

export { DashboardClient };
