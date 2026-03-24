import http from "k6/http";

class EventsApiClient {
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
        this.FULL_PATH = baseUrl + "/events/api/v1/events/";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/events/api/v1/events/";
    }

    /**
    * @param {string } id
    * @param {string } source
    * @param {string } specversion
    * @param {string } type
    * @param {string } subject
    * @param {string } resource
    * @param {string } time
    * @returns http.RefinedResponse
    */
    PostCloudEvent(id, source, specversion, type, subject, resource, time) {
        const token = this.tokenGenerator.getToken();
        const url = this.FULL_PATH;

        const body = {
            id: id,
            source: source,
            specversion: specversion,
            type: type,
            subject: subject,
            resource: resource,
            time: time,
        };

        const params = {
            tags: { name: url },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/cloudevents+json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }
}

export { EventsApiClient };
