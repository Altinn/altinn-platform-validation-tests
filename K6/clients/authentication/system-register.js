import http from "k6/http";

class SystemRegisterApiClient {
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
        this.FULL_PATH = baseUrl + "/authentication/api/v1/systemregister";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/authentication/api/v1/systemregister";
    }

    /**
     * Retrieves the List of all the Registered Systems, except those marked as deleted.
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/get_systemregister|/systemregister}
     * @returns http.RefinedResponse
     */
    GetAllSystemsFromRegister() {
        const token = this.tokenGenerator.getToken();
        const url = this.FULL_PATH;
        const params = {
            tags: { name: url },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Retrieves a Registered System frontend DTO for the systemId.
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/get_systemregister__systemId_|/systemregister/systemId}
     * @param {string } systemId The Id of the Registered System
     * @returns http.RefinedResponse
     */
    GetSystemRegisterById(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Retrieves a Registered System for the systemId.
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/get_systemregister_vendor__systemId_|/systemregister/vendor/systemId}
     * @param {string } systemId The Id of the Registered System
     * @returns http.RefinedResponse
     */
    GetVendorSystemRegisterById(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Replaces the entire registered system
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/put_systemregister_vendor__systemId_|/systemregister/vendor/systemId}
     * @param {string } systemId The Id of the Registered System
     * @param {string } vendorId
     * @param {string } name
     * @param {string[] } clientId
     * @param {{ en: string, nn: string, nb: string } } description
     * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
     * @param {string[] } allowedRedirectUrls
     * @returns http.RefinedResponse
     */
    UpdateVendorSystemRegister(
        systemId,
        vendorId,
        name,
        clientId,
        description,
        rights,
        allowedRedirectUrls
    ) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = {
            "Id": `${vendorId}_${name}`,
            "Vendor": {
                "ID": `0192:${vendorId}` // «0192» is the reference that it is a value from EnhetsRegister # Enhetsregisteret ved Bronnoysundregisterne https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/
            },
            "Name": {
                "en": `${name}`,
                "nb": `${name}`,
                "nn": `${name}`
            },
            "Description": description,
            "rights": rights,
            "allowedRedirectUrls": allowedRedirectUrls,
            "isVisible": false,
            "ClientId": [`${clientId}`]
        };
        return http.put(url, JSON.stringify(body), params);
    }

    /**
    * @param {string } systemId The Id of the Registered System
    * @param {Array<{ urn: string }> } body
    * @returns http.RefinedResponse
    */
    UpdateVendorAccessPackages(systemId, body) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/${systemId}/accesspackages`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/systemId/accesspackages` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.put(url, JSON.stringify(body), params);
    }

    /**
     * Updates the rights on a registered system
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/put_systemregister_vendor__systemId__rights|/systemregister/vendor/systemId/rights}
    *  @param {string } systemId The Id of the Registered System
    *  @param {Array<{action: string, resource: Array<{value: string, id: string}>}>} body
     * @returns http.RefinedResponse
     */
    UpdateRightsVendorSystemRegister(systemId, body) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/${systemId}/rights`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/systemId/rights` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.put(url, JSON.stringify(body), params);
    }

    /**
     * Set the registered system to be deleted.
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/delete_systemregister_vendor__systemId_|/systemregister/vendor/systemId}
     * @param {string } systemId The Id of the Registered System
     * @returns http.RefinedResponse
     */
    DeleteSystemSystemRegister(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.del(url, null, params);
    }

    /**
     * Retrieves a list of the predfined default rights for the Product type, if any
     * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/get_systemregister__systemId__rights|/systemregister/systemId/rights}
     * @param {string } systemId The Id of the Registered System
     * @returns http.RefinedResponse
     */
    GetSystemRegisterRights(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/${systemId}/rights`;
        const params = {
            tags: { name: `${this.FULL_PATH}/systemId/rights` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
    * Create a new System
    * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/SystemRegister/post_systemregister_vendor|/systemregister/vendor}
    * @param {string } vendorId
    * @param {string } name
    * @param {string[] } clientId
    * @param {{ en: string, nn: string, nb: string } } description
    * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
    * @param {string[] } allowedRedirectUrls
    * @returns http.RefinedResponse
    */
    CreateSystemRegister(
        vendorId,
        name,
        clientId,
        description,
        rights = [],
        allowedRedirectUrls = [],
        accessPackages = []
    ) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor`;
        const body = {
            "Id": `${vendorId}_${name}`,
            "Vendor": {
                "ID": `0192:${vendorId}` // «0192» is the reference that it is a value from EnhetsRegister # Enhetsregisteret ved Bronnoysundregisterne https://docs.peppol.eu/poacc/billing/3.0/codelist/eas/
            },
            "Name": {
                "en": `${name}`,
                "nb": `${name}`,
                "nn": `${name}`
            },
            "Description": description,
            "rights": rights,
            "accessPackages": accessPackages,
            "allowedRedirectUrls": allowedRedirectUrls,
            "isVisible": false,
            "ClientId": [`${clientId}`]
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
}

export { SystemRegisterApiClient };
