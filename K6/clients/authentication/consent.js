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

        let tags = {
            endpoint: url.toString(),
            action: TAGS.RequestConsent.action
        };
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
            name: `${this.FULL_PATH}/bff/consentrequests/id/accept`,
            action: TAGS.ApproveConsent.action
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

        let tags = {
            endpoint: url.toString(),
            action: TAGS.LookupConsent.action
        };
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
   *
   * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
   * Requires a Maskinporten token with scope `altinn:consentrequests.read`.
   * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
   *
   * @param {string} [queryString] - URL-encoded query string (without leading "?"), as produced by {@link ConsentRequestEventsQueryBuilder#build}.
   * @param {Object.<string, string>|null} [labels] - Optional request tags.
   * @returns http.RefinedResponse
   */
    GetConsentRequestEvents(queryString = "", labels = null) {
        const token = this.tokenGenerator.getToken();
        const path = `${this.FULL_PATH}/enterprise/consentrequests/events`;
        const url = queryString ? `${path}?${queryString}` : path;

        // Tag with the static path so query params don't fan out the metrics.
        let tags = {
            endpoint: path,
            name: path,
            action: TAGS.GetConsentRequestEvents.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };

        return http.get(url, params);
    }
}

export { ConsentApiClient };
