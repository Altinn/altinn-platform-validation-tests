import http from 'k6/http';

class PdpAuthorizeClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
      baseUrl
    ) {
        /**
        * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
        */
        this.tokenGenerator = undefined;
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
    * Get Authorized Parties
    * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Authorized%20Parties}
    * @param {string} type
    * @param {string} value
    * @param {string} label
    * @returns http.RefinedResponse
    */
    authorizeEnduser(ssn, resourceId, action, subscriptionKey, label = null) {
        //const token = this.tokenGenerator.getToken()
        const url = new URL(this.FULL_PATH);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: 'Bearer ' + this.token,
                'Content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            },
        };
        

        const body = this.#getEnduserBody(ssn, resourceId, action);
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    setToken(token) {
        this.token = token;
    } 

    setTokenGenerator(tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
    }

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
    }
    return body;

}
}

export { PdpAuthorizeClient };
