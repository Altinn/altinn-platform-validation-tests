import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetFavorites: {
        action: "get-favorites",
    },
    AddFavorite: {
        action: "add-favorite",
    },
    DeleteFavorite: {
        action: "delete-favorite",
    },
};

class FavoritesClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        this.tokenGenerator = tokenGenerator;

        this.BASE_PATH = "/profile/api/v1/users/current/party-groups/favorites";

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the favorite parties for the current user.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFavorites(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetFavorites.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds a party to the favorites group for the current user.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AddFavorite(partyUuid, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyUuid}`,
                action: TAGS.AddFavorite.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes a party from the favorites group for the current user.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteFavorite(partyUuid, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyUuid}`,
                action: TAGS.DeleteFavorite.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { FavoritesClient };
