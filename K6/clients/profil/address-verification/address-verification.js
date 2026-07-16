import http from "k6/http";

const TAGS = {
    GetVerifiedAddresses: {
        action: "get-verified-addresses",
    },
    VerifyAddress: {
        action: "verify-address",
    },
    SendVerificationCode: {
        action: "send-verification-code",
    },
    ResendVerificationCode: {
        action: "resend-verification-code",
    },
};

class AddressVerificationClient {
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
        this.BASE_PATH = "/users/current/verification";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets all verified addresses for the current user.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetVerifiedAddresses(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/verified-addresses`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetVerifiedAddresses.action,
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
     * Verifies an address for the current user by providing the verification code
     * sent to the address.
     *
     * @param {AddressVerificationRequest} request
     * Request body. Prefer using
     * {@link AddressVerificationRequestBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    VerifyAddress(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/verify`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.VerifyAddress.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            JSON.stringify(request),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }
    /**
     * Starts the verification process for the current user and the given address
     * by generating and sending a verification code.
     *
     * @param {AddressCodeSendRequest} request
     * Request body. Prefer using
     * {@link AddressCodeSendRequestBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SendVerificationCode(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/send`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.SendVerificationCode.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            JSON.stringify(request),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }
    /**
     * Resets the verification process for the current user and the given address
     * by regenerating and sending a new verification code.
     *
     * @param {AddressCodeResendRequest} request
     * Request body. Prefer using
     * {@link AddressCodeResendRequestBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResendVerificationCode(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/resend`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResendVerificationCode.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            JSON.stringify(request),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }
}

export { AddressVerificationClient };
