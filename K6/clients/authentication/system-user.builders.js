import { SystemUserUpdateDto } from "./types.js";

export class SystemUserUpdateDtoBuilder {
    constructor() {
        /** @type {SystemUserUpdateDto} */
        this.request = {
            id: null,
            partyId: null,
            reporteeOrgNo: null,
            integrationTitle: null,
            systemId: null,
        };
    }

    /**
     * @param {string|null} id See the client method.
     * @returns {SystemUserUpdateDtoBuilder} This builder, for chaining.
     */
    withId(id) {
        this.request.id = id;
        return this;
    }

    /**
     * @param {string|null} partyId See the client method.
     * @returns {SystemUserUpdateDtoBuilder} This builder, for chaining.
     */
    withPartyId(partyId) {
        this.request.partyId = partyId;
        return this;
    }

    /**
     * @param {string|null} reporteeOrgNo See the client method.
     * @returns {SystemUserUpdateDtoBuilder} This builder, for chaining.
     */
    withReporteeOrgNo(reporteeOrgNo) {
        this.request.reporteeOrgNo = reporteeOrgNo;
        return this;
    }

    /**
     * @param {string|null} integrationTitle See the client method.
     * @returns {SystemUserUpdateDtoBuilder} This builder, for chaining.
     */
    withIntegrationTitle(integrationTitle) {
        this.request.integrationTitle = integrationTitle;
        return this;
    }

    /**
     * @param {string|null} systemId See the client method.
     * @returns {SystemUserUpdateDtoBuilder} This builder, for chaining.
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @returns {SystemUserUpdateDto} The built payload.
     */
    build() {
        return this.request;
    }
}
