import http from 'k6/http';

class ConsentApiClient {
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
        this.FULL_PATH = baseUrl + "/accessmanagement/api/v1"
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1"
    }

    /**
    * Request Consent
    * Docs {@link https://docs.altinn.studio/authorization/guides/system-vendor/consent/#12-api-endpoint}
    * @param {string} id
    * @param {string} from
    * @param {string} to
    * @param {string} validTo
    * @param {Array<{ action: string[], resource: [ {type: string, value: string}], metaData: Object }> } consentRights
    * @param {string} redirectUrl
    * @returns http.RefinedResponse
    */
    RequestConsent(id, from, to, validTo, consentRights, redirectUrl) {
        const token = this.tokenGenerator.getToken()
        const url = `${this.FULL_PATH}/enterprise/consentrequests`
        const body = {
            "id": id,
            "from": from,
            "to": to,
            "validTo": validTo,
            "consentRights": consentRights,
            "redirectUrl": redirectUrl
        };

        const params = {
            tags: { name: url },
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-type': 'application/json',
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }

    /**
    * Approve Consent
    * Docs {@link https://docs.altinn.studio/authorization/guides/system-vendor/consent/#12-api-endpoint}
    * @param {string } id
    * @returns http.RefinedResponse
    */
    ApproveConsent(id) {
        const token = this.tokenGenerator.getToken()
        const url = `${this.FULL_PATH}/bff/consentrequests/${id}/accept`
        const body = { "language": "nb" };

        const params = {
            tags: { name: `${this.FULL_PATH}/bff/consentrequests/id/accept` },
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-type': 'application/json',
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }
}

export { ConsentApiClient }
