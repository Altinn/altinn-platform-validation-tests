import http from "k6/http";
import { getNextUrlPaginatedResponse } from "../common/get-next-url-paginated-response.js";

class SystemUserRequestApiClient {
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
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/authentication/api/v1/systemuser/request";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/authentication/api/v1/systemuser/request";
    }

    /**
    * Creates a new Request based on a SystemId for a SystemUser.
    * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/RequestSystemUser/post_systemuser_request_vendor}
    * @param {string } systemId
    * @param {string } partyOrgNo
    * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
    * @param {string } redirectUrl
    * @param {Array<{ urn: string }> } accessPackages
    * @returns http.RefinedResponse
    */
    CreateSystemUserRequest(
        systemId,
        partyOrgNo,
        rights = [],
        redirectUrl = "",
        accessPackages = []
    ) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor`;
        const body = {
            "systemId": systemId,
            "partyOrgNo": partyOrgNo,
            "rights": rights,
            "accessPackages": accessPackages,
            "redirectUrl": redirectUrl
        };
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }

    /**
    * Approves the systemuser requet and creates a system user
    * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/RequestSystemUser/post_systemuser_request__party___requestId__approve|/systemuser/request/party/requestId/approve}
    * @param {string } partyId
    * @param {string } requestId
    * @returns http.RefinedResponse
    */
    ApproveSystemUserRequest(
        partyId,
        requestId
    ) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/${partyId}/${requestId}/approve`;

        const params = {
            tags: { name: `${this.FULL_PATH}/partyId/requestId/approve` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, null, params);
    }

    /**
    * Creates a system user request of type agent
    * OpenAPI for {@link https://docs.altinn.studio/nb/api/authentication/spec/#/RequestSystemUser/post_systemuser_request_vendor_agent}
    * @param {string } externalRef
    * @param {string } systemId
    * @param {string} partyOrgNo
    * @param {Array<{ urn: string }> } accessPackages
    * @param {string } redirectUrl
    * @returns http.RefinedResponse
    */
    CreateAgentSystemUserRequest(
        externalRef,
        systemId,
        partyOrgNo,
        accessPackages = [],
        redirectUrl = "",
    ) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/agent`;
        const body = {
            "externalRef": externalRef,
            "systemId": systemId,
            "partyOrgNo": partyOrgNo,
            "accessPackages": accessPackages,
            "redirectUrl": redirectUrl
        };
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/agent` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url, JSON.stringify(body), params);
    }

    /**
     * Retrieves system user requests for a given systemId for a vendor.
     * OpenAPI for {@link https://docs.altinn.studio/nb/api/authentication/spec/#/}
     * @param {string} systemId
     * @returns http.RefinedResponse
     */
    GetSystemUserRequestsBySystemIdForVendor(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/bysystem/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/bysystem/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Retrieves agent system user requests for a given systemId for a vendor.
     * @param {string} systemId
     * @returns http.RefinedResponse
     */
    GetAgentSystemUserRequestsBySystemIdForVendor(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/agent/bysystem/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/agent/bysystem/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Follows pagination using a fully qualified URL from links.next.
     * @param {string} url Fully qualified URL from the API response (links.next)
     * @returns http.RefinedResponse
     */
    GetSystemUserRequestsByUrl(url) {
        const token = this.tokenGenerator.getToken();
        return getNextUrlPaginatedResponse(token, url);
    }
}

export { SystemUserRequestApiClient };
