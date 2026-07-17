import http from "k6/http";

const TAGS = {
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    GetNotificationAddressesByEmail: {
        action: "get-notification-addresses-by-email",
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
     * Gets all notification addresses for the given organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetNotificationAddresses(organizationNumber, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/${organizationNumber}/notificationaddresses`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
 * Gets all notification addresses for the given email address.
 *
 * @param {string} emailAddress Email address.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
 */
    GetNotificationAddressesByEmail(emailAddress, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/organizations/notificationaddresses/email/${emailAddress}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetNotificationAddressesByEmail.action,
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
     * Gets all notification addresses for the given phone number.
     *
     * @param {string} phoneNumber Phone number.
     * @param {{countrycode?: string}|null} [query]
     * Optional query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetNotificationAddressesByPhoneNumber(
        phoneNumber,
        query = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/organizations/notificationaddresses/phonenumber/${phoneNumber}`,
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
            action: TAGS.GetNotificationAddressesByPhoneNumber.action,
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

export { DashboardClient };
