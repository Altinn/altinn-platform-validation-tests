import http from "k6/http";

const TAGS = {
    CreateAltinn2Account: {
        action: "create-altinn2-account",
    },
    SendForgotPassword: {
        action: "send-forgot-password",
    },
    CreateAltinn2AccountFromToken: {
        action: "create-altinn2-account-from-token",
    },
};

/**
 * Client for the self identified user endpoints of the Access Management BFF
 * API.
 */
class SelfIdentifiedUserClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/selfidentifieduser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a self identified Altinn 2 account.
     *
     * @param {Altinn2AccountRequest|null} [body] The account to create. Prefer
     * using {@link Altinn2AccountRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAltinn2Account(body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/altinn2account`);

        let tags = {
            endpoint: `${this.FULL_PATH}/altinn2account`,
            name: `${this.FULL_PATH}/altinn2account`,
            action: TAGS.CreateAltinn2Account.action,
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
     * Starts password recovery for a self identified Altinn 2 account.
     *
     * @param {Altinn2ForgotPasswordRequest|null} [body] The account to recover the
     * password for. Prefer using {@link Altinn2ForgotPasswordRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    SendForgotPassword(body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/altinn2account/forgotpassword`);

        let tags = {
            endpoint: `${this.FULL_PATH}/altinn2account/forgotpassword`,
            name: `${this.FULL_PATH}/altinn2account/forgotpassword`,
            action: TAGS.SendForgotPassword.action,
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
     * Creates a self identified Altinn 2 account from a one time token.
     *
     * @param {Altinn2AccountFromTokenRequest|null} [body] The token to create the
     * account from. Prefer using {@link Altinn2AccountFromTokenRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAltinn2AccountFromToken(body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/altinn2account/token`);

        let tags = {
            endpoint: `${this.FULL_PATH}/altinn2account/token`,
            name: `${this.FULL_PATH}/altinn2account/token`,
            action: TAGS.CreateAltinn2AccountFromToken.action,
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
}

export { SelfIdentifiedUserClient };
