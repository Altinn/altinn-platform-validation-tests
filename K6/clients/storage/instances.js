import http from "k6/http";

import { DataValues, Instance, PresentationTexts, Substatus } from "./instances.types.js";

const TAGS = {
    QueryInstances: {
        action: "query-instances",
    },
    CreateInstance: {
        action: "create-instance",
    },
    GetInstanceByGuid: {
        action: "get-instance-by-guid",
    },
    GetInstance: {
        action: "get-instance",
    },
    DeleteInstance: {
        action: "delete-instance",
    },
    CompleteInstance: {
        action: "complete-instance",
    },
    UpdateDataValues: {
        action: "update-data-values",
    },
    UpdatePresentationTexts: {
        action: "update-presentation-texts",
    },
    UpdateReadStatus: {
        action: "update-read-status",
    },
    UpdateSubStatus: {
        action: "update-sub-status",
    },
};

class InstancesClient {
    /**
     * Creates a client for the Instances API.
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

    static get TAGS() {
        return TAGS;
    }

    /**
     * Queries instances across applications.
     *
     * GET /instances
     *
     * @param {{[key: string]: *}} query Query parameters, e.g. org, appId, process.currentTask, instanceOwner.partyId, continuationToken, size, order and includeDataElements.
     * @param {string} instanceOwnerIdentifier Value for the X-Ai-InstanceOwnerIdentifier header.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    QueryInstances(query = null, instanceOwnerIdentifier = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances`,
            name: `${this.FULL_PATH}/instances`,
            action: TAGS.QueryInstances.action,
        };

        const requestHeaders = {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        };

        if (instanceOwnerIdentifier !== null) {
            requestHeaders["X-Ai-InstanceOwnerIdentifier"] = instanceOwnerIdentifier;
        }

        return http.get(url.toString(), {
            tags,
            headers: requestHeaders,
        });
    }

    /**
     * Creates an instance of an application.
     *
     * POST /instances
     *
     * @param {Instance} request Instance to create.
     * @param {string} appId Application id, e.g. ttd/my-app.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstance(request, appId = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances`);

        if (appId !== null) {
            url.searchParams.append("appId", appId);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances`,
            name: `${this.FULL_PATH}/instances`,
            action: TAGS.CreateInstance.action,
        };

        return http.post(url.toString(), JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Gets an instance by its guid alone.
     *
     * GET /instances/{instanceGuid}
     *
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceByGuid(instanceGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceGuid}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceGuid}`,
            action: TAGS.GetInstanceByGuid.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstance(instanceOwnerPartyId, instanceGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
            action: TAGS.GetInstance.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Deletes an instance. Responds with 200 and the instance, or 204 when hard deleted.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {boolean} hard Whether to hard delete the instance.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteInstance(instanceOwnerPartyId, instanceGuid, hard = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}`);

        if (hard !== null) {
            url.searchParams.append("hard", hard);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
            action: TAGS.DeleteInstance.action,
        };

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Marks an instance as completely confirmed by the application owner.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/complete
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CompleteInstance(instanceOwnerPartyId, instanceGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/complete`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/complete`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/complete`,
            action: TAGS.CompleteInstance.action,
        };

        return http.post(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Replaces the data values of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/datavalues
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {DataValues} request Data values to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateDataValues(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/datavalues`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/datavalues`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/datavalues`,
            action: TAGS.UpdateDataValues.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Replaces the presentation texts of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/presentationtexts
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {PresentationTexts} request Presentation texts to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdatePresentationTexts(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/presentationtexts`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/presentationtexts`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/presentationtexts`,
            action: TAGS.UpdatePresentationTexts.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Sets the read status of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/readstatus
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} status Read status to set, e.g. Read or Unread.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateReadStatus(instanceOwnerPartyId, instanceGuid, status = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/readstatus`);

        if (status !== null) {
            url.searchParams.append("status", status);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/readstatus`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/readstatus`,
            action: TAGS.UpdateReadStatus.action,
        };

        return http.put(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Sets the substatus of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/substatus
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {Substatus} request Substatus to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateSubStatus(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/substatus`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/substatus`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/substatus`,
            action: TAGS.UpdateSubStatus.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }
}

export { InstancesClient };
