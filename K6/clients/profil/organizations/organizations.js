import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { NotificationAddressRequest } from "./organizations.types.js";

const TAGS = {
    GetNotificationAddresses: {
        action: "get-notification-addresses",
    },
    CreateNotificationAddress: {
        action: "create-notification-address",
    },
    GetNotificationAddress: {
        action: "get-notification-address",
    },
    UpdateNotificationAddress: {
        action: "update-notification-address",
    },
    DeleteNotificationAddress: {
        action: "delete-notification-address",
    },
};

class OrganizationsClient {
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
        this.BASE_PATH = "/profile/api/v1/organizations";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets notification addresses for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddresses(organizationNumber, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
                action: TAGS.GetNotificationAddresses.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {NotificationAddressRequest} request Notification address request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateNotificationAddress(
        organizationNumber,
        request,
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory`,
                action: TAGS.CreateNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets a specific notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetNotificationAddress(
        organizationNumber,
        notificationAddressId,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
                action: TAGS.GetNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {NotificationAddressRequest} request Notification address request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateNotificationAddress(
        organizationNumber,
        notificationAddressId,
        request,
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
                action: TAGS.UpdateNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes a notification address for an organization.
     *
     * @param {string} organizationNumber Organization number.
     * @param {number} notificationAddressId Notification address identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteNotificationAddress(
        organizationNumber,
        notificationAddressId,
        labels = null,
    ) {
        return http.del(
            `${this.FULL_PATH}/${organizationNumber}/notificationaddresses/mandatory/${notificationAddressId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{organizationNumber}/notificationaddresses/mandatory/{notificationAddressId}`,
                action: TAGS.DeleteNotificationAddress.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { OrganizationsClient };
