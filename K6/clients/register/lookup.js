import http from "k6/http";

export class RegisterLookupClient {
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
     * @property {string} BASE_PATH The path to the api without host information
     */
    this.BASE_PATH = "/register/api/v1/access-management/parties/query?fields=";
    /**
     * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
     */
    this.FULL_PATH = baseUrl + this.BASE_PATH;
  }

  /**
   *
   * @param {string} fields
   * @returns http.RefinedResponse
   */
  /**
   /**
    * Lookup parties in register.
    *
    * @param {string} fields - Comma separated list of fields used to query which fields to include in the result.
    *   Example usage: fields="person,party,user" results in endpoint 
    *   <code>register/api/v1/access-management/parties/query?fields=person,party,user</code>
    * @param {string|null} label - Optional label for the request tag.
    * @returns http.RefinedResponse
    */
  /**
   * Lookup parties in register.
   *
   * @param {string} fields - Comma separated list of fields used to query which fields to include in the result.
   *   Example usage: fields="person,party,user" results in endpoint
   *   <code>register/api/v1/access-management/parties/query?fields=person,party,user</code>
   * @param {{ data: string[] }} query - Request body for lookup.
   *   Examples:
   *   - <code>{ data: ["urn:altinn:party:username:Vegard"] }</code>
   *   - <code>{ data: ["urn:altinn:user:id:2051839"] }</code>
   * @param {string|null} label - Optional label for the request tag.
   * @returns http.RefinedResponse
   */
  LookupParties(fields, query, label = null) {
    if (query === null || query === undefined) {
      throw new Error("LookupParties: query is required but was not provided");
    }
    if (!Array.isArray(query?.data) || query.data.length === 0) {
      throw new Error(
        "LookupParties: query.data must be a non-empty array of URNs"
      );
    }

    const token = this.tokenGenerator.getToken();

    let urlString = this.FULL_PATH;
    if (fields !== null && fields !== undefined) {
      urlString += fields;
    }
    const url = new URL(urlString);

    const body = JSON.stringify(query);
    const params = {
      tags: { name: label || url.toString() },
      headers: {
        PlatformAccessToken: `${token}`,
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": __ENV.REGISTER_SUBSCRIPTION_KEY,
      },
    };
    console.log("Subscription key: ", __ENV.REGISTER_SUBSCRIPTION_KEY);
    return http.post(url.toString(), body, params);
  }
}
