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
     * @param {string|null} id
     * @returns {SystemUserUpdateDtoBuilder}
     */
    withId(id) {
        this.request.id = id;
        return this;
    }

    /**
     * @param {string|null} partyId
     * @returns {SystemUserUpdateDtoBuilder}
     */
    withPartyId(partyId) {
        this.request.partyId = partyId;
        return this;
    }

    /**
     * @param {string|null} reporteeOrgNo
     * @returns {SystemUserUpdateDtoBuilder}
     */
    withReporteeOrgNo(reporteeOrgNo) {
        this.request.reporteeOrgNo = reporteeOrgNo;
        return this;
    }

    /**
     * @param {string|null} integrationTitle
     * @returns {SystemUserUpdateDtoBuilder}
     */
    withIntegrationTitle(integrationTitle) {
        this.request.integrationTitle = integrationTitle;
        return this;
    }

    /**
     * @param {string|null} systemId
     * @returns {SystemUserUpdateDtoBuilder}
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @returns {SystemUserUpdateDto}
     */
    build() {
        return this.request;
    }
}
