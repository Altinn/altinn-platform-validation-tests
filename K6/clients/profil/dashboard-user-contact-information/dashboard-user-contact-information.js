import http from "k6/http";

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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/${organizationNumber}/contactinformation`;

        let tags = {
            endpoint: `${this.FULL_PATH}/organizations/{organizationNumber}/contactinformation`,
            name: `${this.FULL_PATH}/organizations/{organizationNumber}/contactinformation`,
            action: TAGS.GetContactInformation.action,
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
     * Gets all user contact information for the given email address.
     *
     * @param {string} emailAddress Email address.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetContactInformationByEmail(emailAddress, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/contactinformation/email`;

        let tags = {
            endpoint: `${this.FULL_PATH}/organizations/contactinformation/email`,
            name: `${this.FULL_PATH}/organizations/contactinformation/email`,
            action: TAGS.GetContactInformationByEmail.action,
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
                emailAddress,
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/contactinformation/phonenumber`;

        let tags = {
            endpoint: `${this.FULL_PATH}/organizations/contactinformation/phonenumber`,
            name: `${this.FULL_PATH}/organizations/contactinformation/phonenumber`,
            action: TAGS.GetContactInformationByPhoneNumber.action,
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
                phoneNumber,
                ...(query?.countrycode == null ? {} : { countrycode: query.countrycode }),
            },
        });
    }
}

export { DashboardUserContactInformationClient };
