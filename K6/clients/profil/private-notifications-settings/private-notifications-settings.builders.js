/**
 * Builder for PrivateNotificationSettingsUpdateRequest.
 */
class PrivateNotificationSettingsUpdateRequestBuilder {
    constructor() {
        this.request = {};
    }

    /**
     * Sets the phone number.
     *
     * Must be on international format (+CCNNNN...).
     *
     * @param {string|null} value
     * @returns {PrivateNotificationSettingsUpdateRequestBuilder}
     */
    withValue(value) {
        if (value !== null) {
            const pattern = /^(\+[0-9]{2}[0-9]+)$/;

            if (!pattern.test(value)) {
                throw new Error(
                    "value must be a valid international phone number (e.g. +4798765432).",
                );
            }
        }

        this.request.value = value;

        return this;
    }

    /**
     * Builds the request.
     *
     * @returns {PrivateNotificationSettingsUpdateRequest}
     */
    build() {
        return this.request;
    }
}

export { PrivateNotificationSettingsUpdateRequestBuilder };
