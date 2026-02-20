import http from "k6/http";

class AccessPackageApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at23.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator,
        bff=false,
    ) {
        /**
        * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
        */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/accesspackage";
        this.BASE_PATH_BFF = "/accessmanagement/api/v1/accesspackage";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        if (bff) {
            this.FULL_PATH = baseUrl + this.BASE_PATH_BFF;
        } else {
            this.FULL_PATH = baseUrl + this.BASE_PATH;
        }
    }

    PostDelegations(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), null, params);
    }

    DeleteDelegations(queryParams, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/delegations`);
      const tags = label ? label : url.toString();
      const params = {
          tags: { name: tags },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
          },
      };
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
      return http.del(url.toString(), null, params);
  }

  GetDelegationCheck(queryParams, label = null) {
    const token = this.tokenGenerator.getToken();
    const url = new URL(`${this.FULL_PATH}/delegationcheck`);
    const tags = label ? label : url.toString();
    const params = {
        tags: { name: tags },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
    console.log(`Making request to ${url.toString()}`);
    return http.get(url.toString(), params);
  }

  GetPermission(accessPackageId, queryParams, label = null) {
    const token = this.tokenGenerator.getToken();
    const url = new URL(`${this.FULL_PATH}/permission/${accessPackageId}`);
    const tags = label ? label : url.toString();
    const params = {
        tags: { name: tags },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
    console.log(`Making request to ${url.toString()}`);
    return http.get(url.toString(), params);
  }
}

export { AccessPackageApiClient };