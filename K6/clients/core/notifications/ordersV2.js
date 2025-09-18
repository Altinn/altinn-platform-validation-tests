import http from 'k6/http';

class OrdersV2ApiClient {
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
        this.FULL_PATH = baseUrl + "/notifications/api/v1/future/orders"
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/notifications/api/v1/future/orders"
    }

    /**
    * @param {string } idempotencyId
    * @param {string } sendersReference
    * @param {string } requestedSendTime
    * @param {Object } recipient
    * @param {Array<Object> } reminders
    * @returns http.RefinedResponse
    */
    PostNotificationOrderV2(
        idempotencyId,
        sendersReference,
        requestedSendTime,
        recipient,
        reminders
    ) {
        const token = this.tokenGenerator.getToken()
        const url = this.FULL_PATH

        const body = {
            "idempotencyId": idempotencyId,
            "sendersReference": sendersReference,
            "requestedSendTime": requestedSendTime,
            "recipient": recipient,
            "reminders": reminders
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

export { OrdersV2ApiClient }
