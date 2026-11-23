import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { InstanceWrite, ProcessNext } from "./apps.types.js";

const TAGS = {
    CreateNewInstance: {
        action: "create-new-instance",
    },
    MoveInstanceToNextProcessStep: {
        action: "move-instance-to-next-process-step",
    },
};

class InstancesClient {
    /**
     * Creates a client for the instances API of an Altinn app.
     *
     * @param {string} baseUrl The apps host of the service owner, e.g. https://ttd.apps.tt02.altinn.no.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} FULL_PATH The apps host, since every path starts with the org and app.
         */
        this.FULL_PATH = baseUrl;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Create new instance.
     *
     * POST /{org}/{app}/instances
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {InstanceWrite} instance The instance document, which names the instance owner.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateNewInstance(org, app, instance, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${org}/${app}/instances`,
            jsonBody(instance),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances`,
                action: TAGS.CreateNewInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Move instance to next process step.
     *
     * PUT /{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next
     *
     * @param {string} org The service owner of the app.
     * @param {string} app The app name.
     * @param {string} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {ProcessNext|null} [processNext] Optional action to perform.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    MoveInstanceToNextProcessStep(org, app, instanceOwnerPartyId, instanceGuid, processNext = null, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${org}/${app}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/next`,
            processNext === null ? null : jsonBody(processNext),
            requestParams({
                endpoint: `${this.FULL_PATH}/{org}/{app}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next`,
                action: TAGS.MoveInstanceToNextProcessStep.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: processNext !== null,
            }),
        );
    }
}

export { InstancesClient };
