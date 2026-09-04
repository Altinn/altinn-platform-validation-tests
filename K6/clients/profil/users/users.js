import http from "k6/http";

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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${userID}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{userID}`,
            name: `${this.FULL_PATH}/{userID}`,
            action: TAGS.GetUserById.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/byuuid/${userUuid}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/byuuid/{userUuid}`,
            name: `${this.FULL_PATH}/byuuid/{userUuid}`,
            action: TAGS.GetUserByUuid.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/current`;

        let tags = {
            endpoint: `${this.FULL_PATH}/current`,
            name: `${this.FULL_PATH}/current`,
            action: TAGS.GetCurrentUser.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = this.FULL_PATH;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetUserBySsn.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(ssn), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/current/profilesettings`;

        let tags = {
            endpoint: `${this.FULL_PATH}/current/profilesettings`,
            name: `${this.FULL_PATH}/current/profilesettings`,
            action: TAGS.UpdateProfileSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/current/profilesettings`;

        let tags = {
            endpoint: `${this.FULL_PATH}/current/profilesettings`,
            name: `${this.FULL_PATH}/current/profilesettings`,
            action: TAGS.PatchProfileSettings.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.patch(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }
}

export { UsersClient };
