import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { NotificationAddressModel, SettingsControllerUpdateSelectedLanguageRequest } from "../common/common.types.js";

const TAGS = {
    UpdateSelectedLanguage: {
        action: "update-selected-language",
    },
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    CreateNotificationAddress: {
        action: "create-notification-address",
    },
    DeleteNotificationAddress: {
        action: "delete-notification-address",
    },
    UpdateNotificationAddress: {
        action: "update-notification-address",
    },
};

/**
 * Client for the settings endpoints of the Access Management BFF API.
 */
class SettingsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/settings";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Updates the language of the authenticated user.
     *
     * @param {SettingsControllerUpdateSelectedLanguageRequest|null} [body] The
     * language to select. Prefer using
     * {@link SettingsControllerUpdateSelectedLanguageRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateSelectedLanguage(body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/language/selectedLanguage`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/language/selectedLanguage`,
                action: TAGS.UpdateSelectedLanguage.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the notification addresses of an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddresses(orgNumber, labels = null) {
        return http.get(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses`,
            requestParams({
                endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
                action: TAGS.GetNotificationAddresses.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds a notification address to an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {NotificationAddressModel|null} [body] The notification address to
     * add. Prefer using {@link NotificationAddressModelBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateNotificationAddress(orgNumber, body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses`,
                action: TAGS.CreateNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Removes a notification address from an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {number} notificationAddressId Notification address id.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteNotificationAddress(
        orgNumber,
        notificationAddressId,
        labels = null,
    ) {
        return http.del(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
                action: TAGS.DeleteNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates a notification address of an organisation.
     *
     * @param {string} orgNumber Organisation number.
     * @param {number} notificationAddressId Notification address id.
     * @param {NotificationAddressModel|null} [body] The new notification address
     * values. Prefer using {@link NotificationAddressModelBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateNotificationAddress(
        orgNumber,
        notificationAddressId,
        body = null,
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}/org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/org/{orgNumber}/notificationaddresses/{notificationAddressId}`,
                action: TAGS.UpdateNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { SettingsClient };
