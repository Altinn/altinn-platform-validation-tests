/**
 * Builder for the {@link Altinn2AccountRequest} request body.
 */
class Altinn2AccountRequestBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Required. User name of the account.
     *
     * @param {string} userName User name of the account.
     * @returns {Altinn2AccountRequestBuilder} This builder, for chaining.
     */
    withUserName(userName) {
        this.body.userName = userName;
        return this;
    }

    /**
     * Required. Password of the account.
     *
     * @param {string} password Password of the account.
     * @returns {Altinn2AccountRequestBuilder} This builder, for chaining.
     */
    withPassword(password) {
        this.body.password = password;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {Altinn2AccountRequest} The built payload.
     */
    build() {
        return this.body;
    }
}

/**
 * Builder for the {@link Altinn2ForgotPasswordRequest} request body.
 */
class Altinn2ForgotPasswordRequestBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Required. User name of the account.
     *
     * @param {string} userName User name of the account.
     * @returns {Altinn2ForgotPasswordRequestBuilder} This builder, for chaining.
     */
    withUserName(userName) {
        this.body.userName = userName;
        return this;
    }

    /**
     * Optional. Language of the recovery message, e.g. nb.
     *
     * @param {string} language Language of the recovery message, e.g. nb.
     * @returns {Altinn2ForgotPasswordRequestBuilder} This builder, for chaining.
     */
    withLanguage(language) {
        this.body.language = language;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {Altinn2ForgotPasswordRequest} The built payload.
     */
    build() {
        return this.body;
    }
}

/**
 * Builder for the {@link Altinn2AccountFromTokenRequest} request body.
 */
class Altinn2AccountFromTokenRequestBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Required. One time token identifying the account.
     *
     * @param {string} token One time token identifying the account.
     * @returns {Altinn2AccountFromTokenRequestBuilder} This builder, for chaining.
     */
    withToken(token) {
        this.body.token = token;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {Altinn2AccountFromTokenRequest} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    Altinn2AccountFromTokenRequestBuilder,
    Altinn2AccountRequestBuilder,
    Altinn2ForgotPasswordRequestBuilder,
};
