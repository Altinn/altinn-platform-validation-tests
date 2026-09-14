import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { ProfileSettingPutRequest, ProfileSettingsPatchRequest } from "./users.types.js";

const TAGS = {
    GetUserById: {
        action: "get-user-by-id",
    },
    GetUserByUuid: {
        action: "get-user-by-uuid",
    },
    GetCurrentUser: {
        action: "get-current-user",
    },
    GetUserBySsn: {
        action: "get-user-by-ssn",
    },
    UpdateProfileSettings: {
        action: "update-profile-settings",
    },
    PatchProfileSettings: {
        action: "patch-profile-settings",
    },
};

class UsersClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        this.tokenGenerator = tokenGenerator;

        this.BASE_PATH = "/profile/api/v1/users";

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the user profile for a given user id.
     *
     * GET /users/{userID}
     *
     * @param {number} userID User id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUserById(userID, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${userID}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{userID}`,
                action: TAGS.GetUserById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the user profile for a given user uuid.
     *
     * GET /users/byuuid/{userUuid}
     *
     * @param {string} userUuid User UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUserByUuid(userUuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/byuuid/${userUuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/byuuid/{userUuid}`,
                action: TAGS.GetUserByUuid.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the user profile of the authenticated user.
     *
     * GET /users/current
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCurrentUser(labels = null) {
        return http.get(
            `${this.FULL_PATH}/current`,
            requestParams({
                endpoint: `${this.FULL_PATH}/current`,
                action: TAGS.GetCurrentUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the user profile for a given social security number.
     *
     * POST /users
     *
     * @param {string} ssn Social security number.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUserBySsn(ssn, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(ssn),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetUserBySsn.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Replaces the profile settings of the authenticated user.
     *
     * PUT /users/current/profilesettings
     *
     * @param {ProfileSettingPutRequest} request Profile settings.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateProfileSettings(request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/current/profilesettings`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/current/profilesettings`,
                action: TAGS.UpdateProfileSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates parts of the profile settings of the authenticated user.
     *
     * PATCH /users/current/profilesettings
     *
     * @param {ProfileSettingsPatchRequest} request Profile settings to change.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PatchProfileSettings(request, labels = null) {
        return http.patch(
            `${this.FULL_PATH}/current/profilesettings`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/current/profilesettings`,
                action: TAGS.PatchProfileSettings.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { UsersClient };
