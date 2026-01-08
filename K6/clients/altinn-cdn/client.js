import http from "k6/http";

class AltinnCdnClient {
    /**
     *
     * @param {string} baseUrl e.g. https://altinncdn.no
     */
    constructor(
        baseUrl = __ENV.ALTINN_CDN_BASE_URL
    ) {
        this.BASE_URL = baseUrl;
    }

    /**
    * GetOrgs
    * @param {string} environment
    * @returns A three digit list of orgs
    */
    GetOrgs(environment = "all") {
        if (environment == "prod") {
            environment = "production";
        }
        const orgs = [];
        const res = http.get(this.BASE_URL + "/orgs/altinn-orgs.json");
        console.log(this.BASE_URL + "/orgs/altinn-orgs.json");
        if (res.status == 200) {
            const res_body = JSON.parse(res.body);
            for (let [org, meta] of Object.entries(res_body["orgs"])) {
                if (environment == "all") {
                    orgs.push(org);
                }
                else if (meta.environments.length > 0) {
                    for (let env of meta.environments) {
                        if (env == environment) {
                            orgs.push(org);
                        }
                    }
                }
            }
        } else {
            throw new Error(`Failed to get organizations: ${res.body}`);
        }
        return orgs;
    }

    /**
     * GetBaseUrlForOrgInEnvironment
     * @param {string} org
     * @param {string} environment
     * @returns The base URL for the particular org and environment
     */
    GetBaseUrlForOrgInEnvironment(org, environment = "tt02") {
        let endpoint = "";
        if (environment == "tt02") {
            endpoint = `https://${org}.apps.tt02.altinn.no`;
        } else if (environment == "prod") {
            endpoint = `https://${org}.apps.altinn.no`;
        }
        return endpoint;
    }
    /**
     * GetBaseUrlForOrgInEnvironment
     * @param {string} org
     * @param {string} environment
     * @returns The domain for the particular org and environment
     */
    GetDomainForOrgAndEnvironment(org, environment = "tt02") {
        let domain = "";
        if (environment == "tt02") {
            domain = `${org}.apps.tt02.altinn.no`;
        } else if (environment == "prod") {
            domain = `${org}.apps.altinn.no`;
        }
        return domain;
    }
}

export { AltinnCdnClient };
