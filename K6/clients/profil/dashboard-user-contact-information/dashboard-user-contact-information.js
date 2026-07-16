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
        this.BASE_PATH = "/dashboard";

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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetContactInformation(organizationNumber, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/${organizationNumber}/contactinformation`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }


    /**
 * Gets all user contact information for the given email address.
 *
 * @param {string} emailAddress Email address.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
    GetContactInformationByEmail(emailAddress, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/contactinformation/email/${emailAddress}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
 * Gets all user contact information for the given phone number.
 *
 * @param {string} phoneNumber Phone number. Must contain between 5 and 15 digits.
 * @param {{countrycode?: string}|null} [query]
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
    GetContactInformationByPhoneNumber(
        phoneNumber,
        query = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/organizations/contactinformation/phonenumber/${phoneNumber}`,
        );

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: url.origin + url.pathname,
            name: url.origin + url.pathname,
            action: TAGS.GetContactInformationByPhoneNumber.action,
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
            },
        });
    }
}

export { DashboardUserContactInformationClient };
