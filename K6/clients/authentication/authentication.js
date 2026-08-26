import http from "k6/http";

const TAGS = {
    ExchangeToken: {
        action: "authentication-exchange-token",
    },
};

class AuthenticationClient {
    /**
     * Unlike the other clients here, the token is the subject of the calls rather
     * than only how they authenticate: the exchange endpoint takes a token from a
     * trusted external provider and hands back an Altinn one. So the generator is
     * optional, and a caller can pass a token of its own to see what the endpoint
     * makes of it.
     *
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} [tokenGenerator] Generates the external bearer token to exchange.
     */
    constructor(baseUrl, tokenGenerator = null) {
        /**
         * Generates the external token that gets exchanged.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/authentication/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Exchanges a token from a trusted external provider for an Altinn token.
     *
     * Anonymous: what is checked is the token in the header, not who is calling.
     *
     * @param {string} tokenProvider The provider that issued the token. One of "id-porten", "maskinporten" or "altinnstudio".
     * @param {object} [options] What to send.
     * @param {string|null} [options.token] The token to exchange. Defaults to the one the generator serves, and null sends no Authorization header at all.
     * @param {boolean} [options.test] Only relevant for Maskinporten: asks for the org to be treated as ttd when the consumer is digdir.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ExchangeToken(tokenProvider, options = {}, labels = null) {
        const token = "token" in options
            ? options.token
            : this.tokenGenerator?.getToken();

        let url = `${this.FULL_PATH}/exchange/${encodeURIComponent(tokenProvider)}`;

        if (options.test !== undefined) {
            url = `${url}?test=${options.test}`;
        }

        // The provider stays out of the name tag, or metrics get one series per
        // provider, and the same for the query.
        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/exchange/{tokenProvider}`,
            action: TAGS.ExchangeToken.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = /** @type {{[key: string]: string}} */ ({
            Accept: "application/json",
        });

        if (token !== null && token !== undefined) {
            headers.Authorization = `Bearer ${token}`;
        }

        return http.get(url, { tags, headers });
    }
}

export {
    AuthenticationClient,
};
