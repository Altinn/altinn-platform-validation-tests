import http from "k6/http";

class SubscriptionsApiClient {
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
        this.FULL_PATH = baseUrl + "/events/api/v1/subscriptions/";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/events/api/v1/subscriptions/";
    }

    /**
    * @param {string } endPoint
    * @param {string } resourceFilter
    * @returns http.RefinedResponse
    */
    PostSubscription(endPoint, resourceFilter) {
        const token = this.tokenGenerator.getToken();
        const url = this.FULL_PATH;

        const body = {
            endPoint: endPoint,
            resourceFilter: resourceFilter,
        };

        const params = {
            tags: { name: url },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }
}

export { SubscriptionsApiClient };
