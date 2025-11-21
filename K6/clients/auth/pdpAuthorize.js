import http from "k6/http";

class PdpAuthorizeClient {
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
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/authorization/api/v1/authorize";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
    * POST authorize enduser
    * Docs {@link https://docs.altinn.studio/nb/api/authorization/spec/#/Decision/post_authorize}
    * @param {string} ssn - social security number
    * @param {string} resourceId - e.g. ttd-dialogporten-performance-test-02
    * @param {string} subscriptionKey - subscription key for the API
    * @param {string} action - e.g. read, write, sign
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    authorizeEnduser(ssn, resourceId, action, subscriptionKey, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
                "Ocp-Apim-Subscription-Key": subscriptionKey
            },
        };


        const body = this.#getEnduserBody(ssn, resourceId, action);
        const res = http.post(url.toString(), JSON.stringify(body), params);
        return res;
    }

    /**
    * POST authorize DAGL
    * Docs {@link https://docs.altinn.studio/nb/api/authorization/spec/#/Decision/post_authorize}
    * @param {string} ssn - social security number
    * @param {string} resourceId - e.g. ttd-dialogporten-performance-test-02
    * @param {string} orgno - organization number
    * @param {string} subscriptionKey - subscription key for the API
    * @param {string} action - e.g. read, write, sign
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    authorizeDagl(ssn, resourceId, orgno, action, subscriptionKey, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
                "Ocp-Apim-Subscription-Key": subscriptionKey
            },
        };


        const body = this.#getDaglBody(ssn, resourceId, orgno, action);
        const res = http.post(url.toString(), JSON.stringify(body), params);
        return res;
    }

    /**
    * POST authorize systemuser
    * Docs {@link https://docs.altinn.studio/nb/api/authorization/spec/#/Decision/post_authorize}
    * @param {string} ssn - social security number
    * @param {string} resourceId - e.g. ttd-dialogporten-performance-test-02
    * @param {string} orgno - organization number
    * @param {string} subscriptionKey - subscription key for the API
    * @param {string} action - e.g. read, write, sign
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    authorizeSystemuser(ssn, resourceId, orgno, action, subscriptionKey, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(this.FULL_PATH);
      let nameTag = label ? label : url.toString();
      const params = {
          tags: { name: nameTag },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
              "Ocp-Apim-Subscription-Key": subscriptionKey
          },
      };


      const body = this.#getDaglBody(ssn, resourceId, orgno, action);
      const res = http.post(url.toString(), JSON.stringify(body), params);
      return res;
  }

    /**
     * get body for enduser authorization
     * @param {*} ssn - social security number
     * @param {*} resourceId - e.g. ttd-dialogporten-performance-test-02
     * @param {*} action -  e.g. read, write, sign
     * @returns body for authorize enduser
     */
    #getEnduserBody(ssn, resourceId, action) {
        let body = this.#buildAuthorizeBody(resourceId, action);
        body.Request.AccessSubject[0].Attribute.push(
            {
                "AttributeId": "urn:altinn:person:identifier-no",
                "Value": ssn
            });
        body.Request.Resource[0].Attribute.push(
            {
                "AttributeId": "urn:altinn:person:identifier-no",
                "Value": ssn,
                "DataType": "http://www.w3.org/2001/XMLSchema#string"
            });
        return body;
    }

    /**
     * get body for dagl authorization
     * @param {*} ssn - social security number
     * @param {*} resourceId - e.g. ttd-dialogporten-performance-test-02
     * @param {*} orgno - organization number
     * @param {*} action -  e.g. read, write, sign
     * @returns body for authorize dagl
     */  
    #getDaglBody(ssn, resourceId, orgno, action) {
        let body = this.#buildAuthorizeBody(resourceId, action);
        body.Request.AccessSubject[0].Attribute.push(
            { 
                "AttributeId": "urn:altinn:person:identifier-no",
                "Value": ssn
            });
        body.Request.Resource[0].Attribute.push(
            {
                "AttributeId": "urn:altinn:organization:identifier-no",
                "Value": orgno,
                "DataType": "http://www.w3.org/2001/XMLSchema#string"
            });
        return body;
    }

    /**
     * build base authorize body
     * @param {*} resourceId - e.g. ttd-dialogporten-performance-test-02
     * @param {*} action - e.g. read, write, sign
     * @returns base body for authorize
     */
    #buildAuthorizeBody(resourceId, action) {
        let body = {
            "Request": {
                "ReturnPolicyIdList": false,
                "AccessSubject": [
                    {
                        "Attribute": [
                        ]
                    }
                ],
                "Action": [
                    {
                        "Attribute": [
                            {
                                "AttributeId": "urn:oasis:names:tc:xacml:1.0:action:action-id",
                                "Value": action,
                                "DataType": "http://www.w3.org/2001/XMLSchema#string"
                            }
                        ]
                    }
                ],
                "Resource": [
                    {
                        "Attribute": [
                            {
                                "AttributeId": "urn:altinn:resource",
                                "Value": resourceId
                            }
                        ]
                    }
                ]
            }
        };
        return body;

    }
}

export { PdpAuthorizeClient };
