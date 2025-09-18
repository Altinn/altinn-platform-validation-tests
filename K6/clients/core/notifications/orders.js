import http from 'k6/http';

class OrdersApiClient {
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
        this.tokenGenerator = tokenGenerator
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/notifications/api/v1/orders"
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/notifications/api/v1/orders/"
    }

    /**
    * @param {string } subject
    * @param {string } emailBody
    * @param {string } contentType
    * @param {string } fromAddress
    * @returns http.RefinedResponse
    */
    PostEmailNotificationOrder(subject, emailBody, contentType, fromAddress) {
        const token = this.tokenGenerator.getToken()
        const url = this.FULL_PATH

        const body = {
            "subject": subject,
            "body": emailBody,
            "contentType": contentType,
            "fromAddress": fromAddress
        }

        const params = {
            tags: { name: url },
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-type': 'application/json',
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }
}

export { OrdersApiClient }
