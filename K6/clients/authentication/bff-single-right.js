import http from "k6/http";

// https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/singleright/delegate?
        // party=16b6fcaa-65e3-4042-ac7e-987b65c4c6de&
        // from=16b6fcaa-65e3-4042-ac7e-987b65c4c6de&
        // to=611d1e21-bb37-4590-833f-bd1504c4d5fd&
        // resourceId=testressurs-tilgangspakke-org-miljorydding-miljorensing-og-lignende-1
        // ["urn:altinn:resource:testressurs-tilgangspakke-org-miljorydding-miljorensing-og-lignende-1:
        //    urn:oasis:names:tc:xacml:1.0:action:action-id:read",
        // "urn:altinn:resource:testressurs-tilgangspakke-org-miljorydding-miljorensing-og-lignende-1:
        //  urn:oasis:names:tc:xacml:1.0:action:action-id:write",
        // "urn:altinn:resource:testressurs-tilgangspakke-org-miljorydding-miljorensing-og-lignende-1:
        // urn:oasis:names:tc:xacml:1.0:action:action-id:access"]
class BffSingleRightApiClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/singleright";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        
        this.FULL_PATH = baseUrl + this.BASE_PATH;
  
    }

    PostDelegate(queryParams, resource, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegate`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = this.#getBody(resource);
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    #getBody(resource) {
      return [
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:read`,
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:write`,
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:access`,
        ]
    }
}

export { BffSingleRightApiClient };