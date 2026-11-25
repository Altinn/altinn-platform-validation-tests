import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";

const TAGS = {
    NotificationLogGetEndUser: {
        action: "notification-log-get-enduser",
    },
};

class NotificationLogClient {
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
        this.BASE_PATH = "/notifications/api/v1/future/enduser/log";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gives end users access to their own notification log entries based on
     * the provided Dialogporten identifiers. Needs an end user token from
     * ID-porten.
     *
     * @param {string} dialogId Dialogporten dialog identifier to filter by.
     * @param {string|null} [transmissionId]
     * Optional Dialogporten transmission identifier to filter by.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    NotificationLogGetEndUser(dialogId, transmissionId = null, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, { dialogId, transmissionId }),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.NotificationLogGetEndUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    NotificationLogClient,
};
