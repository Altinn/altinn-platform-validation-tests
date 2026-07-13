import http from "k6/http";

const TAGS = {
    GetApplications: {
        action: "get-applications",
    },
    CreateApplication: {
        action: "create-application",
    },
    GetApplicationsByOrg: {
        action: "get-applications-by-org",
    },
    GetApplication: {
        action: "get-application",
    },
    UpdateApplication: {
        action: "update-application",
    },
    DeleteApplication: {
        action: "delete-application",
    },
    CreateTextResource: {
        action: "create-text-resource",
    },
    GetTextResource: {
        action: "get-text-resource",
    },
    UpdateTextResource: {
        action: "update-text-resource",
    },
    DeleteTextResource: {
        action: "delete-text-resource",
    },
};

class ApplicationsClient {
    /**
     * Creates a client for the Applications API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/storage/api/v1";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Default request tags used by the client.
     *
     * @returns {object} Default k6 tags.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Get all applications.
     *
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    GetApplications(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.GetApplications.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Create application metadata.
     *
     * @param {string|null} appId Application identifier.
     * @param {Application} application Application metadata.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    CreateApplication(appId, application, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/applications`);

        if (appId !== null && appId !== undefined) {
            url.searchParams.append("appId", appId);
        }

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.CreateApplication.action,
        };

        return http.post(
            url.toString(),
            JSON.stringify(application),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Get all applications for an organization.
     *
     * @param {string} org Organization identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    GetApplicationsByOrg(org, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.GetApplicationsByOrg.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Get application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    GetApplication(org, app, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.GetApplication.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Update application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {Application} application Application metadata.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    UpdateApplication(org, app, application, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.UpdateApplication.action,
        };

        return http.put(
            url,
            JSON.stringify(application),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Delete application metadata.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {boolean|null} hard Permanently delete.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    DeleteApplication(org, app, hard = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/applications/${org}/${app}`,
        );

        if (hard !== null && hard !== undefined) {
            url.searchParams.append("hard", hard);
        }

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.DeleteApplication.action,
        };

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Create text resource.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {TextResource} textResource Text resource.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    CreateTextResource(org, app, textResource, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/applications/${org}/${app}/texts`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.CreateTextResource.action,
        };

        return http.post(
            url,
            JSON.stringify(textResource),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Get text resource.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {string} language Language code.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    GetTextResource(org, app, language, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.GetTextResource.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Update text resource.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {string} language Language code.
     * @param {TextResource} textResource Text resource.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    UpdateTextResource(org, app, language, textResource, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.UpdateTextResource.action,
        };

        return http.put(
            url,
            JSON.stringify(textResource),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Delete text resource.
     *
     * @param {string} org Organization identifier.
     * @param {string} app Application identifier.
     * @param {string} language Language code.
     * @param {{[key:string]:string}|null} labels Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    DeleteTextResource(org, app, language, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/applications/${org}/${app}/texts/${language}`;

        const tags = {
            ...labels,
            endpoint: url,
            name: url,
            action: TAGS.DeleteTextResource.action,
        };

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export { ApplicationsClient };
