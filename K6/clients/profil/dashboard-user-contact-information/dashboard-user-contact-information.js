import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetContactInformation: {
        action: "get-contact-information",
    },
    GetContactInformationByEmail: {
        action: "get-contact-information-by-email",
    },
    GetContactInformationByPhoneNumber: {
        action: "get-contact-information-by-phone-number",
    },
};

class DashboardUserContactInformationClient {
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
     * Gets all user contact information for the given organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetContactInformation(organizationNumber, labels = null) {
        return http.get(
            `${this.FULL_PATH}/organizations/${organizationNumber}/contactinformation`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/{organizationNumber}/contactinformation`,
                action: TAGS.GetContactInformation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets all user contact information for the given email address.
     *
     * @param {string} emailAddress Email address.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetContactInformationByEmail(emailAddress, labels = null) {
        return http.get(
            `${this.FULL_PATH}/organizations/contactinformation/email`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/contactinformation/email`,
                action: TAGS.GetContactInformationByEmail.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { emailAddress },
            }),
        );
    }

    /**
     * Gets all user contact information for the given phone number.
     *
     * @param {string} phoneNumber Phone number. Must contain between 5 and 15 digits.
     * @param {{countrycode?: string}|null} [query]
     * Optional country code, sent as an HTTP header by this endpoint.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetContactInformationByPhoneNumber(
        phoneNumber,
        query = null,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/organizations/contactinformation/phonenumber`,
            requestParams({
                endpoint: `${this.FULL_PATH}/organizations/contactinformation/phonenumber`,
                action: TAGS.GetContactInformationByPhoneNumber.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { phoneNumber, countrycode: query?.countrycode },
            }),
        );
    }
}

export { DashboardUserContactInformationClient };
