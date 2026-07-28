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
     * @param {string|null} id TODO: Description
     * @returns {SystemUserUpdateDtoBuilder} TODO: Description
     */
    withId(id) {
        this.request.id = id;
        return this;
    }

    /**
     * @param {string|null} partyId TODO: Description
     * @returns {SystemUserUpdateDtoBuilder} TODO: Description
     */
    withPartyId(partyId) {
        this.request.partyId = partyId;
        return this;
    }

    /**
     * @param {string|null} reporteeOrgNo TODO: Description
     * @returns {SystemUserUpdateDtoBuilder} TODO: Description
     */
    withReporteeOrgNo(reporteeOrgNo) {
        this.request.reporteeOrgNo = reporteeOrgNo;
        return this;
    }

    /**
     * @param {string|null} integrationTitle TODO: Description
     * @returns {SystemUserUpdateDtoBuilder} TODO: Description
     */
    withIntegrationTitle(integrationTitle) {
        this.request.integrationTitle = integrationTitle;
        return this;
    }

    /**
     * @param {string|null} systemId TODO: Description
     * @returns {SystemUserUpdateDtoBuilder} TODO: Description
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @returns {SystemUserUpdateDto} TODO: Description
     */
    build() {
        return this.request;
    }
}
