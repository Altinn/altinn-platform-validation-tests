import http from "k6/http";

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
     * Creates k6 tags for a request.
     *
     * @param {string} action Action tag.
     * @param {string} template Templated path, appended to the base path.
     * @param {string} url Fully-qualified request URL.
     * @param {{[key: string]: string}|null} labels Optional k6 request labels.
     * @returns {{[key: string]: string}} Request tags.
     */
    #getTags(action, template, url, labels) {
        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}${template}`,
            action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return tags;
    }

    /**
     * Builds the request headers.
     *
     * @param {boolean} [withBody] Whether the request carries a JSON body.
     * @returns {{[key: string]: string}} Request headers.
     */
    #getHeaders(withBody = false) {
        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            Accept: "application/json",
        };

        if (withBody) {
            headers["Content-Type"] = "application/json";
        }

        return headers;
    }

    /**
     * Gets the user profile for a given user id.
     *
     * GET /users/{userID}
     *
     * @param {number} userID User id.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetUserById(userID, labels = null) {
        const url = `${this.FULL_PATH}/${userID}`;

        return http.get(url, {
            tags: this.#getTags(
                TAGS.GetUserById.action,
                "/{userID}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Gets the user profile for a given user uuid.
     *
     * GET /users/byuuid/{userUuid}
     *
     * @param {string} userUuid User UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetUserByUuid(userUuid, labels = null) {
        const url = `${this.FULL_PATH}/byuuid/${userUuid}`;

        return http.get(url, {
            tags: this.#getTags(
                TAGS.GetUserByUuid.action,
                "/byuuid/{userUuid}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Gets the user profile of the authenticated user.
     *
     * GET /users/current
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetCurrentUser(labels = null) {
        const url = `${this.FULL_PATH}/current`;

        return http.get(url, {
            tags: this.#getTags(
                TAGS.GetCurrentUser.action,
                "/current",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Gets the user profile for a given social security number.
     *
     * POST /users
     *
     * @param {string} ssn Social security number.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetUserBySsn(ssn, labels = null) {
        const url = this.FULL_PATH;

        return http.post(url, JSON.stringify(ssn), {
            tags: this.#getTags(
                TAGS.GetUserBySsn.action,
                "",
                url,
                labels,
            ),
            headers: this.#getHeaders(true),
        });
    }

    /**
     * Replaces the profile settings of the authenticated user.
     *
     * PUT /users/current/profilesettings
     *
     * @param {ProfileSettingPutRequest} request Profile settings.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateProfileSettings(request, labels = null) {
        const url = `${this.FULL_PATH}/current/profilesettings`;

        return http.put(url, JSON.stringify(request), {
            tags: this.#getTags(
                TAGS.UpdateProfileSettings.action,
                "/current/profilesettings",
                url,
                labels,
            ),
            headers: this.#getHeaders(true),
        });
    }

    /**
     * Updates parts of the profile settings of the authenticated user.
     *
     * PATCH /users/current/profilesettings
     *
     * @param {ProfileSettingsPatchRequest} request Profile settings to change.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    PatchProfileSettings(request, labels = null) {
        const url = `${this.FULL_PATH}/current/profilesettings`;

        return http.patch(url, JSON.stringify(request), {
            tags: this.#getTags(
                TAGS.PatchProfileSettings.action,
                "/current/profilesettings",
                url,
                labels,
            ),
            headers: this.#getHeaders(true),
        });
    }
}

export { UsersClient };
