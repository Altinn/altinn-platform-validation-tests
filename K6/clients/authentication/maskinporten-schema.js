import http from "k6/http";

class MaskinportenSchemaApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at23.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator,
    ) {
        /**
        * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
        */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    PostOffered(from, to, resource, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/${from}/maskinportenschema/offered`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        const body = {
          "to": [
              {
                  "id": "urn:altinn:organizationnumber",
                  "value": to
              }
          ],
          "rights": [
              {
                  "resource": [
                      {
                          "id": "urn:altinn:resource",
                          "value": resource
                      }
                  ]
              }
          ]
      }     
      return http.post(url.toString(), JSON.stringify(body), params);
    }

    GetDelegations(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}maskinporten/delegations`);
        Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
  } 

export { MaskinportenSchemaApiClient };
