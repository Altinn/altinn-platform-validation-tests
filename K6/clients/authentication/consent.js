import http from "k6/http";

const TAGS = {
    RequestConsent: { action: "RequestConsent" },
    ApproveConsent: { action: "ApproveConsent" },
    LookupConsent: { action: "LookupConsent" },
    GetConsentRequestEvents: { action: "GetConsentRequestEvents" },
};

class ConsentApiClient {
    /**
   *
   * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
   * @param {*} tokenGenerator
   */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
     * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
     */
        this.FULL_PATH = baseUrl + "/accessmanagement/api/v1";
        /**
     * @property {string} BASE_PATH The path to the api without host information
     */
        this.BASE_PATH = "/accessmanagement/api/v1";
    }

    static get TAGS() {
        return TAGS;
    }

    /**
   * Request Consent
   * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/request/}
   * @param {string} id
   * @param {string} from
   * @param {string} to
   * @param {string} validTo
   * @param {Array<{ action: string[], resource: [ {type: string, value: string}], metaData: Object }> } consentRights
   * @param {string} redirectUrl
   * @returns http.RefinedResponse
   */
    RequestConsent(id, from, to, validTo, consentRights, redirectUrl, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/enterprise/consentrequests`;
        const body = {
            id: id,
            from: from,
            to: to,
            validTo: validTo,
            consentRights: consentRights,
            redirectUrl: redirectUrl,
        };

        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }

    /**
   * Approve Consent
   * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/request/}
   * Must be approved by en user with scope `altinn:portal/enduser`.
   * @param {string } id
   * @returns http.RefinedResponse
   */
    ApproveConsent(id, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/bff/consentrequests/${id}/accept`;
        let tags = {
            endpoint: `${this.FULL_PATH}/bff/consentrequests/id/accept`,
            name: `${this.FULL_PATH}/bff/consentrequests/id/accept`
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const body = { language: "nb" };
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }

    /**
   * Lookup Maskinporten consent token for a consent request.
   *
   * The endpoint we're using is the endpoint Maskinporten uses to lookup a consent request before returning the token.
   * 
   * Endpoint: /accessmanagement/api/v1/maskinporten/consent/lookup/
   * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/retrieve-token/}
   *
   * @param {string} id
   * @param {string} from
   * @param {string} to
   * @param {string|null} label - Optional label for the request tag.
   * @returns http.RefinedResponse
   */
    LookupConsent(id, from, to, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/maskinporten/consent/lookup/`;
        const body = {
            id,
            from,
            to,
        };

        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        return http.post(url, JSON.stringify(body), params);
    }

    /**
   * Get a page of consent request events for the authenticated organization.
   *
   * Returns events ordered by event id (oldest first), max 100 per page.
   * Follow the `links.next` cursor (passed back as `ContinuationToken`) to page.
   *
   * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
   * Requires a Maskinporten token with scope `altinn:consentrequests.read`.
   * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
   *
   * @param {Object} [queryParams] - Optional query parameters. All are optional.
   * @param {string} [queryParams.ContinuationToken] - Opaque cursor from the `links.next` of a previous response.
   * @param {string} [queryParams.createdAfter] - DateTimeOffset; only events created at or after this timestamp.
   * @param {string} [queryParams.createdBefore] - DateTimeOffset; only events created before this timestamp. Must be strictly greater than `createdAfter` when both are set.
   * @param {string[]} [queryParams.EventType] - Filter by event type (accepted/rejected/revoked/deleted/used). Repeatable.
   * @param {string} [queryParams.ConsentRequestID] - Guid; only events belonging to this consent request.
   * @param {Object.<string, string>|null} [labels] - Optional request tags.
   * @returns http.RefinedResponse
   */
    GetConsentRequestEvents(queryParams = {}, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/enterprise/consentrequests/events`);
        Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
        let tags = { endpoint: url.toString() };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        console.log(url.toString());

        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };

        return http.get(url.toString(), params);
    }
}

export { ConsentApiClient };
