import http from "k6/http";

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
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/notifications/api/v1/orders";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/notifications/api/v1/orders/";
    }

    /**
    * @param { { subject: string, body: string, contentType: string, fromAddress: string } } emailTemplate
    * @param {string } sendersReference
    * @param {Array<{ emailAddress: string, mobileNumber: string, organizationNumber: string, nationalIdentityNumber: string, isReserved: boolean, }> } recipients
    * @returns http.RefinedResponse
    */
    PostEmailNotificationOrder(emailTemplate, sendersReference, recipients) {
        const token = this.tokenGenerator.getToken();
        const url = this.FULL_PATH;

        const body = {
            "notificationChannel": "Email",
            "emailTemplate": emailTemplate,
            "sendersReference": sendersReference,
            "recipients": recipients,
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

export { OrdersApiClient };
