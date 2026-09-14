import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { AddressCodeResendRequest, AddressCodeSendRequest, AddressVerificationRequest } from "./address-verification.types.js";

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
        this.BASE_PATH = "/profile/api/v1/users/current/verification";

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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetVerifiedAddresses(labels = null) {
        return http.get(
            `${this.FULL_PATH}/verified-addresses`,
            requestParams({
                endpoint: `${this.FULL_PATH}/verified-addresses`,
                action: TAGS.GetVerifiedAddresses.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Verifies an address for the current user by providing the verification code
     * sent to the address.
     *
     * @param {AddressVerificationRequest} request
     * Request body. Prefer using
     * {@link AddressVerificationRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    VerifyAddress(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/verify`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/verify`,
                action: TAGS.VerifyAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
    /**
     * Starts the verification process for the current user and the given address
     * by generating and sending a verification code.
     *
     * @param {AddressCodeSendRequest} request
     * Request body. Prefer using
     * {@link AddressCodeSendRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SendVerificationCode(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/send`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/send`,
                action: TAGS.SendVerificationCode.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
    /**
     * Sends a new verification code using the send endpoint. The server's
     * cooldown also applies to resends (429 while the cooldown is active).
     *
     * @param {AddressCodeResendRequest} request
     * Request body. Prefer using
     * {@link AddressCodeResendRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResendVerificationCode(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/send`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/send`,
                action: TAGS.ResendVerificationCode.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { AddressVerificationClient };
