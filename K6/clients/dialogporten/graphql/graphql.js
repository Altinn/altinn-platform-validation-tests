import http, { post } from "k6/http";
import { uuidv4 } from "../../../common-imports.js";

class GraphQLApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator
    ) {
        /**
        * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
        */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/dialogporten/graphql";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/dialogporten/graphql";
    }

    /**
    * TODO: Swagger?
    * @param { object } body
    * @returns http.RefinedResponse
    */
    PostGQ(
        body,
        label = null
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : this.FULL_PATH;
        const params = {
            tags: { name: nameTag },
            headers: {
                "Authorization": "Bearer " + token,
                "Accept": "application/json",
                "User-Agent": "dialogporten-k6",
                "Content-Type": "application/json"
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(body), params);
    }
}

export { GraphQLApiClient };
