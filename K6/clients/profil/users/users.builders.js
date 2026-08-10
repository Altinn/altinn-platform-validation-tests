import { randomUUID } from "k6/experimental/webcrypto";

/**
 * Builder for ProfileSettingPutRequest.
 */
class ProfileSettingPutRequestBuilder {
    constructor() {
        /** @type {ProfileSettingPutRequest} */
        this.request = {
            languageType: null,
            preSelectedPartyId: 0,
            doNotPromptForParty: false,
            showClientUnits: false,
            shouldShowSubEntities: false,
            shouldShowDeletedEntities: false,
            language: "",
            preselectedPartyUuid: null,
        };
    }

    /**
     * @param {string|null} languageType See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithLanguageType(languageType) {
        if (languageType !== null && typeof languageType !== "string") {
            throw new Error("languageType must be a string or null");
        }

        this.request.languageType = languageType;

        return this;
    }

    /**
     * @param {number} preSelectedPartyId See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithPreSelectedPartyId(preSelectedPartyId) {
        if (!Number.isInteger(preSelectedPartyId)) {
            throw new Error("preSelectedPartyId must be an integer");
        }

        this.request.preSelectedPartyId = preSelectedPartyId;

        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithDoNotPromptForParty(value) {
        if (typeof value !== "boolean") {
            throw new Error("doNotPromptForParty must be a boolean");
        }

        this.request.doNotPromptForParty = value;

        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithShowClientUnits(value) {
        if (typeof value !== "boolean") {
            throw new Error("showClientUnits must be a boolean");
        }

        this.request.showClientUnits = value;

        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithShouldShowSubEntities(value) {
        if (typeof value !== "boolean") {
            throw new Error("shouldShowSubEntities must be a boolean");
        }

        this.request.shouldShowSubEntities = value;

        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithShouldShowDeletedEntities(value) {
        if (typeof value !== "boolean") {
            throw new Error("shouldShowDeletedEntities must be a boolean");
        }

        this.request.shouldShowDeletedEntities = value;

        return this;
    }

    /**
     * @param {string} language See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithLanguage(language) {
        if (typeof language !== "string" || language.length < 1) {
            throw new Error("language must be a non-empty string");
        }

        this.request.language = language;

        return this;
    }

    /**
     * @param {string|null} preselectedPartyUuid See the client method.
     * @returns {ProfileSettingPutRequestBuilder} This builder, for chaining.
     */
    WithPreselectedPartyUuid(preselectedPartyUuid) {
        if (
            preselectedPartyUuid !== null &&
            !this.IsValidUuid(preselectedPartyUuid)
        ) {
            throw new Error("preselectedPartyUuid must be a valid UUID or null");
        }

        this.request.preselectedPartyUuid = preselectedPartyUuid;

        return this;
    }

    /**
     * @returns {ProfileSettingPutRequest} The built payload.
     */
    Build() {
        if (!this.request.language) {
            throw new Error("language is required");
        }

        return this.request;
    }

    /**
     * @param {string} value See the client method.
     * @returns {boolean} The built payload.
     */
    IsValidUuid(value) {
        try {
            return randomUUID() !== null && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        } catch {
            return false;
        }
    }
}

/**
 * Builder for ProfileSettingsPatchRequest.
 */
class ProfileSettingsPatchRequestBuilder {
    constructor() {
        /** @type {ProfileSettingsPatchRequest} */
        this.request = {};
    }

    /**
     * @param {string|null} language See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithLanguage(language) {
        if (language !== null && typeof language !== "string") {
            throw new Error("language must be a string or null");
        }

        this.request.language = language;

        return this;
    }

    /**
     * @param {boolean|null} value See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithDoNotPromptForParty(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("doNotPromptForParty must be a boolean or null");
        }

        this.request.doNotPromptForParty = value;

        return this;
    }

    /**
     * @param {string|null} value See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithPreselectedPartyUuid(value) {
        if (value !== null && !this.IsValidUuid(value)) {
            throw new Error("preselectedPartyUuid must be a valid UUID or null");
        }

        this.request.preselectedPartyUuid = {
            hasValue: true,
            value,
        };

        return this;
    }

    /**
     * @param {boolean|null} value See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithShowClientUnits(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("showClientUnits must be a boolean or null");
        }

        this.request.showClientUnits = value;

        return this;
    }

    /**
     * @param {boolean|null} value See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithShouldShowSubEntities(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("shouldShowSubEntities must be a boolean or null");
        }

        this.request.shouldShowSubEntities = value;

        return this;
    }

    /**
     * @param {boolean|null} value See the client method.
     * @returns {ProfileSettingsPatchRequestBuilder} This builder, for chaining.
     */
    WithShouldShowDeletedEntities(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("shouldShowDeletedEntities must be a boolean or null");
        }

        this.request.shouldShowDeletedEntities = value;

        return this;
    }

    /**
     * @returns {ProfileSettingsPatchRequest} The built payload.
     */
    Build() {
        return this.request;
    }

    /**
     * @param {string} value See the client method.
     * @returns {boolean} The built payload.
     */
    IsValidUuid(value) {
        try {
            return randomUUID() !== null && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        } catch {
            return false;
        }
    }
}

export {
    ProfileSettingPutRequestBuilder,
    ProfileSettingsPatchRequestBuilder
};
