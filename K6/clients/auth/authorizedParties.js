import http from "k6/http";

const lengthPartyFilter = (__ENV.LENGTH_PARTY_FILTER ?? "25");

class AuthorizedPartiesClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1";
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
    GetAuthorizedParties(type, value, queryParams, label = null, parties = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resourceowner/authorizedparties`);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        for (const key in queryParams) {
            url.searchParams.append(key, queryParams[key]);
        }

        const body = {
            "type": type,
            "value": value
        };
        if (parties !== null) {
            body["partyFilter"] = this.#getPartyFilter(parties, lengthPartyFilter, value);
        }
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    #getPartyFilter(parties, length, ssn) {
        const result = [{ type: "urn:altinn:person:identifier-no", value: ssn }];
        for (const party of parties) {
            if (result.length >= length) {
                break;
            }
            const [type, id] = party.split(":");
            if (type === "org") {
                result.push({ type: "urn:altinn:organization:identifier-no", value: id });
            } else if (type === "person") {
                result.push({ type: "urn:altinn:person:identifier-no", value: id });
            }
        }
        return result;
    }
}

export { AuthorizedPartiesClient };
