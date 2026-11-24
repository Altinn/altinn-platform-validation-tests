import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { InstanceWrite, ProcessNext } from "./brukermonster-test-app.types.js";

const TAGS = {
    CreateNewInstance: {
        action: "create-new-instance",
    },
    MoveInstanceToNextProcessStep: {
        action: "move-instance-to-next-process-step",
    },
};

class BrukermonsterTestAppClient {
    /**
     * Creates a client for the end user API of ttd/brukermonster-test-app.
     *
     * @param {string} baseUrl The apps host of ttd, e.g. https://ttd.apps.tt02.altinn.no.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} FULL_PATH The path to the app on the apps host.
         */
        this.FULL_PATH = `${baseUrl}/ttd/brukermonster-test-app`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Create new instance.
     *
     * POST /ttd/brukermonster-test-app/instances
     *
     * @param {InstanceWrite} instance The instance document, which names the instance owner.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateNewInstance(instance, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances`,
            jsonBody(instance),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances`,
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
     * PUT /ttd/brukermonster-test-app/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next
     *
     * @param {string} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {ProcessNext|null} [processNext] Optional action to perform.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    MoveInstanceToNextProcessStep(instanceOwnerPartyId, instanceGuid, processNext = null, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/next`,
            processNext === null ? null : jsonBody(processNext),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/next`,
                action: TAGS.MoveInstanceToNextProcessStep.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: processNext !== null,
            }),
        );
    }
}

export { BrukermonsterTestAppClient };
