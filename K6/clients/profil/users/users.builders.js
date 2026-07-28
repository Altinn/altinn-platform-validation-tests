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
     * @param {string|null} languageType TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithLanguageType(languageType) {
        if (languageType !== null && typeof languageType !== "string") {
            throw new Error("languageType must be a string or null");
        }

        this.request.languageType = languageType;

        return this;
    }

    /**
     * @param {number} preSelectedPartyId TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithPreSelectedPartyId(preSelectedPartyId) {
        if (!Number.isInteger(preSelectedPartyId)) {
            throw new Error("preSelectedPartyId must be an integer");
        }

        this.request.preSelectedPartyId = preSelectedPartyId;

        return this;
    }

    /**
     * @param {boolean} value TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithDoNotPromptForParty(value) {
        if (typeof value !== "boolean") {
            throw new Error("doNotPromptForParty must be a boolean");
        }

        this.request.doNotPromptForParty = value;

        return this;
    }

    /**
     * @param {boolean} value TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithShowClientUnits(value) {
        if (typeof value !== "boolean") {
            throw new Error("showClientUnits must be a boolean");
        }

        this.request.showClientUnits = value;

        return this;
    }

    /**
     * @param {boolean} value TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithShouldShowSubEntities(value) {
        if (typeof value !== "boolean") {
            throw new Error("shouldShowSubEntities must be a boolean");
        }

        this.request.shouldShowSubEntities = value;

        return this;
    }

    /**
     * @param {boolean} value TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithShouldShowDeletedEntities(value) {
        if (typeof value !== "boolean") {
            throw new Error("shouldShowDeletedEntities must be a boolean");
        }

        this.request.shouldShowDeletedEntities = value;

        return this;
    }

    /**
     * @param {string} language TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
     */
    WithLanguage(language) {
        if (typeof language !== "string" || language.length < 1) {
            throw new Error("language must be a non-empty string");
        }

        this.request.language = language;

        return this;
    }

    /**
     * @param {string|null} preselectedPartyUuid TODO: Description
     * @returns {ProfileSettingPutRequestBuilder} TODO: Description
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
     * @returns {ProfileSettingPutRequest} TODO: Description
     */
    Build() {
        if (!this.request.language) {
            throw new Error("language is required");
        }

        return this.request;
    }

    /**
     * @param {string} value TODO: Description
     * @returns {boolean} TODO: Description
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
     * @param {string|null} language TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
     */
    WithLanguage(language) {
        if (language !== null && typeof language !== "string") {
            throw new Error("language must be a string or null");
        }

        this.request.language = language;

        return this;
    }

    /**
     * @param {boolean|null} value TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
     */
    WithDoNotPromptForParty(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("doNotPromptForParty must be a boolean or null");
        }

        this.request.doNotPromptForParty = value;

        return this;
    }

    /**
     * @param {string|null} value TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
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
     * @param {boolean|null} value TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
     */
    WithShowClientUnits(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("showClientUnits must be a boolean or null");
        }

        this.request.showClientUnits = value;

        return this;
    }

    /**
     * @param {boolean|null} value TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
     */
    WithShouldShowSubEntities(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("shouldShowSubEntities must be a boolean or null");
        }

        this.request.shouldShowSubEntities = value;

        return this;
    }

    /**
     * @param {boolean|null} value TODO: Description
     * @returns {ProfileSettingsPatchRequestBuilder} TODO: Description
     */
    WithShouldShowDeletedEntities(value) {
        if (value !== null && typeof value !== "boolean") {
            throw new Error("shouldShowDeletedEntities must be a boolean or null");
        }

        this.request.shouldShowDeletedEntities = value;

        return this;
    }

    /**
     * @returns {ProfileSettingsPatchRequest} TODO: Description
     */
    Build() {
        return this.request;
    }

    /**
     * @param {string} value TODO: Description
     * @returns {boolean} TODO: Description
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
