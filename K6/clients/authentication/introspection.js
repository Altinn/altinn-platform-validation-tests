import http from "k6/http";

const TAGS = {
    Introspect: {
        action: "authentication-introspect",
    },
};

class IntrospectionClient {
    /**
     * Like the exchange client, the token here is the subject of the call rather
     * than only how it authenticates: the endpoint answers whether the token it is
     * handed is valid. It still wants a bearer of its own, and answers 401 without
     * one, so a caller can pass either or neither.
     *
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} [tokenGenerator] Generates the bearer, and the token to introspect when the caller passes none.
     */
    constructor(baseUrl, tokenGenerator = null) {
        /**
         * Generates the tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/authentication/api/v1/introspection";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Asks whether a token is valid.
     *
     * The body is form encoded and not JSON, which is what the endpoint takes.
     *
     * @param {object} [options] What to send.
     * @param {string|null} [options.token] The token to introspect. Defaults to the one the generator serves, and null leaves the field out of the body.
     * @param {string|null} [options.tokenTypeHint] What kind of token it is, e.g. "access_token". Left out when not passed.
     * @param {string|null} [options.bearer] The token the call authenticates with. Defaults to the one the generator serves, and null sends no Authorization header at all.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    Introspect(options = {}, labels = null) {
        const token = "token" in options
            ? options.token
            : this.tokenGenerator?.getToken();

        const bearer = "bearer" in options
            ? options.bearer
            : this.tokenGenerator?.getToken();

        const body = /** @type {{[key: string]: string}} */ ({});

        if (token !== null && token !== undefined) {
            body.token = token;
        }

        if (options.tokenTypeHint !== null && options.tokenTypeHint !== undefined) {
            body.token_type_hint = options.tokenTypeHint;
        }

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.Introspect.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = /** @type {{[key: string]: string}} */ ({
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        });

        if (bearer !== null && bearer !== undefined) {
            headers.Authorization = `Bearer ${bearer}`;
        }

        return http.post(this.FULL_PATH, body, { tags, headers });
    }
}

export {
    IntrospectionClient,
};
