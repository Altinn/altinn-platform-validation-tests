/**
 * Builder for creating file transfer initialization requests.
 *
 * @example
 * const request = new FileTransferInitializeRequestBuilder()
 *     .withFileName("document.pdf")
 *     .withResourceId("my-resource")
 *     .withOrganizationSender("991825827")
 *     .withRecipients([
 *         "910909088",
 *     ])
 *     .withChecksum("checksum")
 *     .build();
 */
class FileTransferInitializeRequestBuilder {
    constructor() {
        /** @type {FileTransferInitalizeExt} */
        this.request = {
            fileName: null,
            resourceId: null,
            sender: null,
            recipients: [],
            sendersFileTransferReference: null,
            propertyList: null,
            checksum: null,
            disableVirusScan: null,
        };
    }

    /**
     * Set the file name.
     *
     * @param {string} fileName Filename including extension.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withFileName(fileName) {
        this.request.fileName = fileName;
        return this;
    }

    /**
     * Set the Altinn resource ID.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withResourceId(resourceId) {
        this.request.resourceId = resourceId;
        return this;
    }

    /**
     * Set the sender using an explicit value.
     *
     * @param {string} sender Sender organization identifier.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withSender(sender) {
        this.request.sender = sender;
        return this;
    }

    /**
     * Set an organization sender.
     *
     * @param {string} organizationNumber Norwegian organization number.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withOrganizationSender(organizationNumber) {
        this.request.sender =
            `urn:altinn:organization:identifier-no:${organizationNumber}`;

        return this;
    }

    /**
     * Set a sender using the legacy format.
     *
     * @param {string} organizationNumber Norwegian organization number.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withLegacyOrganizationSender(organizationNumber) {
        this.request.sender = `org:${organizationNumber}`;
        return this;
    }

    /**
     * Set recipients.
     *
     * @param {Array<string>} recipients Recipient organizations.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withRecipients(recipients) {
        this.request.recipients = recipients;
        return this;
    }

    /**
     * Add recipients.
     *
     * @param {Array<string>|string} recipients Recipient organizations.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    addRecipients(recipients) {
        const values = Array.isArray(recipients)
            ? recipients
            : [recipients];

        this.request.recipients = [
            ...this.request.recipients,
            ...values,
        ];

        return this;
    }

    /**
     * Set sender file transfer reference.
     *
     * @param {string} reference External reference.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withSenderReference(reference) {
        this.request.sendersFileTransferReference = reference;
        return this;
    }

    /**
     * Set custom properties.
     *
     * @param {{[key: string]: string}} properties File properties.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withProperties(properties) {
        this.request.propertyList = properties;
        return this;
    }

    /**
     * Set checksum.
     *
     * @param {string} checksum MD5 checksum.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withChecksum(checksum) {
        this.request.checksum = checksum;
        return this;
    }

    /**
     * Disable virus scanning.
     *
     * @param {boolean} value Whether virus scanning should be disabled.
     * @returns {FileTransferInitializeRequestBuilder} Builder instance.
     */
    withVirusScanDisabled(value = true) {
        this.request.disableVirusScan = value;
        return this;
    }

    /**
     * Build the request.
     *
     * @returns {FileTransferInitalizeExt} File transfer initialization request.
     */
    build() {
        if (!this.request.fileName) {
            throw new Error("File name must be specified");
        }

        if (!this.request.resourceId) {
            throw new Error("Resource ID must be specified");
        }

        if (!this.request.sender) {
            throw new Error("Sender must be specified");
        }

        if (this.request.recipients.length === 0) {
            throw new Error("At least one recipient must be specified");
        }

        return {
            ...this.request,
        };
    }
}


/**
 * Builder for creating file transfer query parameters.
 *
 * @example
 * const query = new FileTransferQueryBuilder()
 *     .withResourceId("my-resource")
 *     .withStatus("Published")
 *     .forRecipients()
 *     .orderAscending(true)
 *     .build();
 */
class FileTransferQueryBuilder {
    constructor() {
        /** @type {FileTransferQuery} */
        this.query = {};
    }

    /**
     * Filter by resource ID.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Filter by file transfer status.
     *
     * @param {FileTransferStatusExt} status File transfer status.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Filter by recipient status.
     *
     * @param {RecipientFileTransferStatusExt} status Recipient status.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    withRecipientStatus(status) {
        this.query.recipientStatus = status;
        return this;
    }

    /**
     * Filter from timestamp.
     *
     * @param {string} from ISO date-time.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    from(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Filter to timestamp.
     *
     * @param {string} to ISO date-time.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    to(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Set ordering.
     *
     * @param {boolean} ascending Sort direction.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    orderAscending(ascending = true) {
        this.query.orderAscending = ascending;
        return this;
    }

    /**
     * Filter by sender or recipient role.
     *
     * @param {RoleExt} role Role filter.
     * @returns {FileTransferQueryBuilder} Builder instance.
     */
    withRole(role) {
        this.query.role = role;
        return this;
    }

    /**
     * Build the query.
     *
     * @returns {FileTransferQuery} Query parameters.
     */
    build() {
        return {
            ...this.query,
        };
    }
}

export {
    FileTransferInitializeRequestBuilder,
    FileTransferQueryBuilder,
};
