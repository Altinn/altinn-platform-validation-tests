import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetFavorites(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = this.FULL_PATH;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.GetFavorites.action,
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
     * Adds a party to the favorites group for the current user.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AddFavorite(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{partyUuid}`,
            action: TAGS.AddFavorite.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Removes a party from the favorites group for the current user.
     *
     * @param {string} partyUuid Party UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteFavorite(partyUuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${partyUuid}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{partyUuid}`,
            action: TAGS.DeleteFavorite.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { FavoritesClient };
