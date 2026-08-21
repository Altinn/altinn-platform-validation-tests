import { AddressCodeResendRequest, AddressCodeSendRequest, AddressType, AddressVerificationRequest } from "./address-verification.types.js";

/**
 * Builder for address verification requests.
 */
class AddressVerificationRequestBuilder {
    constructor() {
        this.request = {};
    }

    /**
     * Address to verify, either an email or a phone number.
     *
     * @param {string} value Address value. Must be between 5 and 320 characters.
     * @returns {AddressVerificationRequestBuilder} This builder, for chaining.
     */
    withValue(value) {
        if (typeof value !== "string") {
            throw new Error("value must be a string");
        }

        if (value.length < 5 || value.length > 320) {
            throw new Error(
                "value must be between 5 and 320 characters",
            );
        }

        this.request.value = value;
        return this;
    }

    /**
     * Address type.
     *
     * @param {AddressType} type Address type.
     * @returns {AddressVerificationRequestBuilder} This builder, for chaining.
     */
    withType(type) {
        const allowedTypes = ["Email", "Sms"];

        if (!allowedTypes.includes(type)) {
            throw new Error(
                `type must be one of the following values: ${allowedTypes.join(", ")}`,
            );
        }

        this.request.type = type;
        return this;
    }

    /**
     * Verification code for the address.
     *
     * @param {string} verificationCode Six digit verification code.
     * @returns {AddressVerificationRequestBuilder} This builder, for chaining.
     */
    withVerificationCode(verificationCode) {
        if (typeof verificationCode !== "string") {
            throw new Error("verificationCode must be a string");
        }

        if (!/^\d{6}$/.test(verificationCode)) {
            throw new Error(
                "verificationCode must be exactly 6 digits",
            );
        }

        this.request.verificationCode = verificationCode;
        return this;
    }

    /**
     * Builds the request object.
     *
     * @returns {AddressVerificationRequest} The built payload.
     */
    build() {
        return this.request;
    }
}

/**
 * Builder for address code send requests.
 */
class AddressCodeSendRequestBuilder {
    constructor() {
        this.request = {};
    }

    /**
     * Address to send verification code for.
     *
     * @param {string} value Address value. Must be between 5 and 320 characters.
     * @returns {AddressCodeSendRequestBuilder} This builder, for chaining.
     */
    withValue(value) {
        if (typeof value !== "string") {
            throw new Error("value must be a string");
        }

        if (value.length < 5 || value.length > 320) {
            throw new Error(
                "value must be between 5 and 320 characters",
            );
        }

        this.request.value = value;
        return this;
    }

    /**
     * Address type.
     *
     * @param {AddressType} type Address type.
     * @returns {AddressCodeSendRequestBuilder} This builder, for chaining.
     */
    withType(type) {
        const allowedTypes = ["Email", "Sms"];

        if (!allowedTypes.includes(type)) {
            throw new Error(
                `type must be one of the following values: ${allowedTypes.join(", ")}`,
            );
        }

        this.request.type = type;
        return this;
    }

    /**
     * Builds the request object.
     *
     * @returns {AddressCodeSendRequest} The built payload.
     */
    build() {
        return this.request;
    }
}

/**
 * Builder for address code resend requests.
 */
class AddressCodeResendRequestBuilder {
    constructor() {
        this.request = {};
    }

    /**
     * Address to resend verification code for.
     *
     * @param {string} value Address value. Must be between 5 and 320 characters.
     * @returns {AddressCodeResendRequestBuilder} This builder, for chaining.
     */
    withValue(value) {
        if (typeof value !== "string") {
            throw new Error("value must be a string");
        }

        if (value.length < 5 || value.length > 320) {
            throw new Error(
                "value must be between 5 and 320 characters",
            );
        }

        this.request.value = value;
        return this;
    }

    /**
     * Address type.
     *
     * @param {AddressType} type Address type.
     * @returns {AddressCodeResendRequestBuilder} This builder, for chaining.
     */
    withType(type) {
        const allowedTypes = ["Email", "Sms"];

        if (!allowedTypes.includes(type)) {
            throw new Error(
                `type must be one of the following values: ${allowedTypes.join(", ")}`,
            );
        }

        this.request.type = type;
        return this;
    }

    /**
     * Builds the request object.
     *
     * @returns {AddressCodeResendRequest} The built payload.
     */
    build() {
        return this.request;
    }
}

export {
    AddressCodeResendRequestBuilder,
    AddressCodeSendRequestBuilder,
    AddressVerificationRequestBuilder
};
