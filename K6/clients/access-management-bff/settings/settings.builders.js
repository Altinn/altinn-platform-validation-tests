import { NotificationAddressModel, SettingsControllerUpdateSelectedLanguageRequest } from "../common/common.types.js";

/**
 * Builder for the {@link SettingsControllerUpdateSelectedLanguageRequest}
 * request body.
 */
class SettingsControllerUpdateSelectedLanguageRequestBuilder {
    constructor() {
        this.body = /** @type {SettingsControllerUpdateSelectedLanguageRequest} */ ({});
    }

    /**
     * Optional. Language code to select, e.g. nb.
     *
     * @param {string} languageCode Language code to select, e.g. nb.
     * @returns {SettingsControllerUpdateSelectedLanguageRequestBuilder} This
     * builder, for chaining.
     */
    withLanguageCode(languageCode) {
        this.body.languageCode = languageCode;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {SettingsControllerUpdateSelectedLanguageRequest} The built
     * payload.
     */
    build() {
        return this.body;
    }
}

/**
 * Builder for the {@link NotificationAddressModel} request body.
 */
class NotificationAddressModelBuilder {
    constructor() {
        this.body = /** @type {NotificationAddressModel} */ ({});
    }

    /**
     * Optional. Country code of the phone number, e.g. +47.
     *
     * @param {string} countryCode Country code of the phone number, e.g. +47.
     * @returns {NotificationAddressModelBuilder} This builder, for chaining.
     */
    withCountryCode(countryCode) {
        this.body.countryCode = countryCode;
        return this;
    }

    /**
     * Optional. Email address to notify.
     *
     * @param {string} email Email address to notify.
     * @returns {NotificationAddressModelBuilder} This builder, for chaining.
     */
    withEmail(email) {
        this.body.email = email;
        return this;
    }

    /**
     * Optional. Phone number to notify.
     *
     * @param {string} phone Phone number to notify.
     * @returns {NotificationAddressModelBuilder} This builder, for chaining.
     */
    withPhone(phone) {
        this.body.phone = phone;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {NotificationAddressModel} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    NotificationAddressModelBuilder,
    SettingsControllerUpdateSelectedLanguageRequestBuilder,
};
