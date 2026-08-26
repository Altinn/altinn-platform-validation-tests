import http from "k6/http";

const TAGS = {
    GetDiscoveryDocument: {
        action: "authentication-openid-discovery-document",
    },
    GetKeySet: {
        action: "authentication-openid-key-set",
    },
};

class OpenidClient {
    /**
     * Both endpoints are anonymous, so unlike every other client in this folder this
     * one takes no token generator: a bearer would not change the answer, and asking
     * for one would tie a test of the public metadata to the token generator being
     * up.
     *
     * The base path is the discovery document itself rather than the `/openid/`
     * prefix it sits under, because the key set is addressed relative to the
     * document (`.well-known/openid-configuration/jwks`) and nothing else lives
     * under the prefix that this client reads.
     *
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     */
    constructor(baseUrl) {
        /**
         * Base API path.
         */
        this.BASE_PATH = "/authentication/api/v1/openid/.well-known/openid-configuration";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Reads the OpenID Connect discovery document.
     *
     * This is the entry point a relying party starts from: everything else it needs
     * to validate an Altinn token, the issuer to compare `iss` against and the URL of
     * the key set to verify the signature with, is named in here.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDiscoveryDocument(labels = null) {
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetDiscoveryDocument.action,
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

        return http.get(this.FULL_PATH, { tags, headers });
    }

    /**
     * Reads the JSON Web Key Set the tokens are signed with.
     *
     * A caller can hand over the `jwks_uri` it just read from the discovery document
     * rather than let the client build the URL. That is the point of the parameter:
     * following the document the way a relying party does is what proves the URL it
     * advertises actually serves keys, while the built-in path only proves the
     * endpoint exists where this repo expects it.
     *
     * @param {string|null} [url] Absolute URL to read, e.g. the `jwks_uri` from the discovery document. Defaults to the path under this client's base URL.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetKeySet(url = null, labels = null) {
        const target = url ?? `${this.FULL_PATH}/jwks`;

        // The URL the caller passed stays out of the name tag: a document that points
        // somewhere unexpected should turn a check red, not quietly open a second
        // series in the metrics.
        let tags = {
            endpoint: target,
            name: `${this.FULL_PATH}/jwks`,
            action: TAGS.GetKeySet.action,
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

        return http.get(target, { tags, headers });
    }
}

export {
    OpenidClient,
};
