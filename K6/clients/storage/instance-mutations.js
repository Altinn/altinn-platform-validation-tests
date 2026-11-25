import http from "k6/http";

import { requestParams } from "../common/request.js";
import { VersionMatch, versionMatchHeaders } from "./version-match.js";

const TAGS = {
    MutateInstance: {
        action: "mutate-instance",
    },
};

class InstanceMutationsClient {
    /**
     * Creates a client for the InstanceMutations API.
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
     * Commits a batch of mutations for a single instance.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/mutations
     *
     * The swagger declares no request body schema for this operation, only
     * that a multipart request has the `mutation` JSON as its first part and
     * one part per `contentPartName` after it. The body and its content type
     * are therefore taken as given, so the caller builds the multipart form
     * with k6's `http.file` and passes it here.
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {*} body The mutation batch, as k6 multipart form data or a string.
     * @param {string|null} [contentType] Content type of the body; null lets k6 set it for form data.
     * @param {VersionMatch|null} [versionMatch] Instance and process-state versions the batch is conditioned on.
     * @param {string|null} [idempotencyKey] `Idempotency-Key` header; requires an expected instance version.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    MutateInstance(instanceOwnerPartyId, instanceGuid, body, contentType = null, versionMatch = null, idempotencyKey = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/mutations`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/mutations`,
                action: TAGS.MutateInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: {
                    ...versionMatchHeaders(versionMatch),
                    "Idempotency-Key": idempotencyKey,
                    "Content-Type": contentType,
                },
            }),
        );
    }
}

export { InstanceMutationsClient };
