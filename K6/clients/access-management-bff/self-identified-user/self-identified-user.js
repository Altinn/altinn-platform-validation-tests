import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { Altinn2AccountFromTokenRequest, Altinn2AccountRequest, Altinn2ForgotPasswordRequest } from "../common/common.types.js";

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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAltinn2Account(body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/altinn2account`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/altinn2account`,
                action: TAGS.CreateAltinn2Account.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Starts password recovery for a self identified Altinn 2 account.
     *
     * @param {Altinn2ForgotPasswordRequest|null} [body] The account to recover the
     * password for. Prefer using {@link Altinn2ForgotPasswordRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SendForgotPassword(body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/altinn2account/forgotpassword`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/altinn2account/forgotpassword`,
                action: TAGS.SendForgotPassword.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a self identified Altinn 2 account from a one time token.
     *
     * @param {Altinn2AccountFromTokenRequest|null} [body] The token to create the
     * account from. Prefer using {@link Altinn2AccountFromTokenRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAltinn2AccountFromToken(body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/altinn2account/token`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/altinn2account/token`,
                action: TAGS.CreateAltinn2AccountFromToken.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { SelfIdentifiedUserClient };
