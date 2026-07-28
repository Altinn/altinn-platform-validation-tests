class NotificationOrderChainRequestExtBuilder {
    constructor() {
        this.request = {
            sendersReference: null,
            requestedSendTime: null,
            conditionEndpoint: null,
            dialogportenAssociation: null,
            idempotencyId: null,
            recipient: null,
            reminders: null,
        };
    }

    /**
     * Builds a notification order chain request.
     *
     * Usage:
     * new NotificationOrderChainRequestExtBuilder()
     * .WithIdempotencyId("order-123")
     * .WithRecipient({
     * recipientEmail: {
     * emailAddress: "recipient@example.com",
     * emailSettings: {
     * subject: "Subject",
     * body: "Body",
     * },
     * },
     * })
     * .Build();
     *
     * @returns {NotificationOrderChainRequestExt} The built payload.
     */
    Build() {
        if (this.request.idempotencyId === null) {
            throw new Error(
                "NotificationOrderChainRequestExt.idempotencyId is required",
            );
        }

        if (this.request.recipient === null) {
            throw new Error(
                "NotificationOrderChainRequestExt.recipient is required",
            );
        }

        return this.request;
    }

    /**
     * @param {string|null} sendersReference Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {NotificationRecipientExt} recipient Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithRecipient(recipient) {
        this.request.recipient = recipient;

        return this;
    }

    /**
     * @param {NotificationReminderExt[]} reminders Value to set.
     * @returns {NotificationOrderChainRequestExtBuilder} This builder, for chaining.
     */
    WithReminders(reminders) {
        this.request.reminders = reminders;

        return this;
    }
}

class ComposedEmailRequestExtBuilder {
    constructor() {
        this.request = {
            sendersReference: null,
            requestedSendTime: null,
            conditionEndpoint: null,
            dialogportenAssociation: null,
            idempotencyId: null,
            recipient: null,
        };
    }

    /**
     * Builds a composed email request.
     *
     * Usage:
     * new ComposedEmailRequestExtBuilder()
     * .WithIdempotencyId("order-123")
     * .WithRecipient({
     * emailAddress: "recipient@example.com",
     * emailSettings: {
     * subject: "Subject",
     * body: "Body",
     * attachments: [],
     * },
     * })
     * .Build();
     *
     * @returns {ComposedEmailRequestExt} The built payload.
     */
    Build() {
        if (this.request.idempotencyId === null) {
            throw new Error(
                "ComposedEmailRequestExt.idempotencyId is required",
            );
        }

        if (this.request.recipient === null) {
            throw new Error(
                "ComposedEmailRequestExt.recipient is required",
            );
        }

        return this.request;
    }

    /**
     * @param {string|null} sendersReference Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {RecipientComposedEmailExt} recipient Value to set.
     * @returns {ComposedEmailRequestExtBuilder} This builder, for chaining.
     */
    WithRecipient(recipient) {
        this.request.recipient = recipient;

        return this;
    }
}

class NotificationRecipientExtBuilder {
    constructor() {
        this.request = {
            recipientEmail: null,
            recipientSms: null,
            recipientPerson: null,
            recipientOrganization: null,
            recipientExternalIdentity: null,
        };
    }

    /**
     * @param {RecipientEmailExt} recipientEmail Value to set.
     * @returns {NotificationRecipientExtBuilder} This builder, for chaining.
     */
    WithRecipientEmail(recipientEmail) {
        this.request.recipientEmail = recipientEmail;

        return this;
    }

    /**
     * @param {RecipientSmsExt} recipientSms Value to set.
     * @returns {NotificationRecipientExtBuilder} This builder, for chaining.
     */
    WithRecipientSms(recipientSms) {
        this.request.recipientSms = recipientSms;

        return this;
    }

    /**
     * @param {RecipientPersonExt} recipientPerson Value to set.
     * @returns {NotificationRecipientExtBuilder} This builder, for chaining.
     */
    WithRecipientPerson(recipientPerson) {
        this.request.recipientPerson = recipientPerson;

        return this;
    }

    /**
     * @param {RecipientOrganizationExt} recipientOrganization Value to set.
     * @returns {NotificationRecipientExtBuilder} This builder, for chaining.
     */
    WithRecipientOrganization(recipientOrganization) {
        this.request.recipientOrganization = recipientOrganization;

        return this;
    }

    /**
     * @param {RecipientExternalIdentityExt} recipientExternalIdentity Value to set.
     * @returns {NotificationRecipientExtBuilder} This builder, for chaining.
     */
    WithRecipientExternalIdentity(recipientExternalIdentity) {
        this.request.recipientExternalIdentity = recipientExternalIdentity;

        return this;
    }

    /**
     * @returns {NotificationRecipientExt} The built payload.
     */
    Build() {
        const recipients = [
            this.request.recipientEmail,
            this.request.recipientSms,
            this.request.recipientPerson,
            this.request.recipientOrganization,
            this.request.recipientExternalIdentity,
        ].filter((recipient) => recipient !== null);

        if (recipients.length !== 1) {
            throw new Error(
                "NotificationRecipientExt must contain exactly one recipient",
            );
        }

        return this.request;
    }
}

class RecipientEmailExtBuilder {
    constructor() {
        this.request = {
            emailAddress: null,
            emailSettings: null,
        };
    }

    /**
     * @param {string} emailAddress Value to set.
     * @returns {RecipientEmailExtBuilder} This builder, for chaining.
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings Value to set.
     * @returns {RecipientEmailExtBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientEmailExt} The built payload.
     */
    Build() {
        if (this.request.emailAddress === null) {
            throw new Error("RecipientEmailExt.emailAddress is required");
        }

        if (this.request.emailSettings === null) {
            throw new Error("RecipientEmailExt.emailSettings is required");
        }

        return this.request;
    }
}

class RecipientSmsExtBuilder {
    constructor() {
        this.request = {
            phoneNumber: null,
            smsSettings: null,
        };
    }

    /**
     * @param {string} phoneNumber Value to set.
     * @returns {RecipientSmsExtBuilder} This builder, for chaining.
     */
    WithPhoneNumber(phoneNumber) {
        this.request.phoneNumber = phoneNumber;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings Value to set.
     * @returns {RecipientSmsExtBuilder} This builder, for chaining.
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @returns {RecipientSmsExt} The built payload.
     */
    Build() {
        if (this.request.phoneNumber === null) {
            throw new Error("RecipientSmsExt.phoneNumber is required");
        }

        if (this.request.smsSettings === null) {
            throw new Error("RecipientSmsExt.smsSettings is required");
        }

        return this.request;
    }
}

class RecipientPersonExtBuilder {
    constructor() {
        this.request = {
            emailSettings: null,
            smsSettings: null,
            resourceId: null,
            resourceAction: null,
            nationalIdentityNumber: null,
            channelSchema: null,
            ignoreReservation: null,
            useStaleContactInformation: null,
        };
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} nationalIdentityNumber Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithNationalIdentityNumber(nationalIdentityNumber) {
        this.request.nationalIdentityNumber = nationalIdentityNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @param {boolean|null} ignoreReservation Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithIgnoreReservation(ignoreReservation) {
        this.request.ignoreReservation = ignoreReservation;

        return this;
    }

    /**
     * @param {boolean|null} useStaleContactInformation Value to set.
     * @returns {RecipientPersonExtBuilder} This builder, for chaining.
     */
    WithUseStaleContactInformation(useStaleContactInformation) {
        this.request.useStaleContactInformation =
            useStaleContactInformation;

        return this;
    }

    /**
     * @returns {RecipientPersonExt} The built payload.
     */
    Build() {
        if (this.request.nationalIdentityNumber === null) {
            throw new Error(
                "RecipientPersonExt.nationalIdentityNumber is required",
            );
        }

        if (this.request.channelSchema === null) {
            throw new Error("RecipientPersonExt.channelSchema is required");
        }

        return this.request;
    }
}

class RecipientOrganizationExtBuilder {
    constructor() {
        this.request = {
            emailSettings: null,
            smsSettings: null,
            resourceId: null,
            resourceAction: null,
            orgNumber: null,
            channelSchema: null,
        };
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} orgNumber Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithOrgNumber(orgNumber) {
        this.request.orgNumber = orgNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema Value to set.
     * @returns {RecipientOrganizationExtBuilder} This builder, for chaining.
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientOrganizationExt} The built payload.
     */
    Build() {
        if (this.request.orgNumber === null) {
            throw new Error("RecipientOrganizationExt.orgNumber is required");
        }

        if (this.request.channelSchema === null) {
            throw new Error(
                "RecipientOrganizationExt.channelSchema is required",
            );
        }

        return this.request;
    }
}

class RecipientExternalIdentityExtBuilder {
    constructor() {
        this.request = {
            emailSettings: null,
            smsSettings: null,
            resourceId: null,
            resourceAction: null,
            externalIdentity: null,
            channelSchema: null,
        };
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} externalIdentity Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithExternalIdentity(externalIdentity) {
        this.request.externalIdentity = externalIdentity;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema Value to set.
     * @returns {RecipientExternalIdentityExtBuilder} This builder, for chaining.
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientExternalIdentityExt} The built payload.
     */
    Build() {
        if (this.request.externalIdentity === null) {
            throw new Error(
                "RecipientExternalIdentityExt.externalIdentity is required",
            );
        }

        if (this.request.channelSchema === null) {
            throw new Error(
                "RecipientExternalIdentityExt.channelSchema is required",
            );
        }

        return this.request;
    }
}

class RecipientComposedEmailExtBuilder {
    constructor() {
        this.request = {
            emailAddress: null,
            emailSettings: null,
        };
    }

    /**
     * @param {string} emailAddress Value to set.
     * @returns {RecipientComposedEmailExtBuilder} This builder, for chaining.
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {ComposedEmailSendingOptionsExt} emailSettings Value to set.
     * @returns {RecipientComposedEmailExtBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientComposedEmailExt} The built payload.
     */
    Build() {
        if (this.request.emailAddress === null) {
            throw new Error(
                "RecipientComposedEmailExt.emailAddress is required",
            );
        }

        if (this.request.emailSettings === null) {
            throw new Error(
                "RecipientComposedEmailExt.emailSettings is required",
            );
        }

        return this.request;
    }
}

class EmailSendingOptionsExtBuilder {
    constructor() {
        this.request = {
            senderEmailAddress: null,
            subject: null,
            body: null,
            contentType: null,
            sendingTimePolicy: null,
        };
    }

    /**
     * @param {string|null} senderEmailAddress Value to set.
     * @returns {EmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject Value to set.
     * @returns {EmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body Value to set.
     * @returns {EmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType Value to set.
     * @returns {EmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy Value to set.
     * @returns {EmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {EmailSendingOptionsExt} The built payload.
     */
    Build() {
        if (this.request.subject === null) {
            throw new Error("EmailSendingOptionsExt.subject is required");
        }

        if (this.request.body === null) {
            throw new Error("EmailSendingOptionsExt.body is required");
        }

        return this.request;
    }
}

class SmsSendingOptionsExtBuilder {
    constructor() {
        this.request = {
            sender: null,
            body: null,
            sendingTimePolicy: null,
        };
    }

    /**
     * @param {string|null} sender Value to set.
     * @returns {SmsSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSender(sender) {
        this.request.sender = sender;

        return this;
    }

    /**
     * @param {string} body Value to set.
     * @returns {SmsSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy Value to set.
     * @returns {SmsSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {SmsSendingOptionsExt} The built payload.
     */
    Build() {
        if (this.request.body === null) {
            throw new Error("SmsSendingOptionsExt.body is required");
        }

        return this.request;
    }
}

class ComposedEmailSendingOptionsExtBuilder {
    constructor() {
        this.request = {
            senderEmailAddress: null,
            subject: null,
            body: null,
            contentType: null,
            sendingTimePolicy: null,
            attachments: null,
        };
    }

    /**
     * @param {string|null} senderEmailAddress Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @param {SasFileReferenceExt[]} attachments Value to set.
     * @returns {ComposedEmailSendingOptionsExtBuilder} This builder, for chaining.
     */
    WithAttachments(attachments) {
        this.request.attachments = attachments;

        return this;
    }

    /**
     * @returns {ComposedEmailSendingOptionsExt} The built payload.
     */
    Build() {
        if (this.request.subject === null) {
            throw new Error(
                "ComposedEmailSendingOptionsExt.subject is required",
            );
        }

        if (this.request.body === null) {
            throw new Error(
                "ComposedEmailSendingOptionsExt.body is required",
            );
        }

        return this.request;
    }
}

class SasFileReferenceExtBuilder {
    constructor() {
        this.request = {
            filename: null,
            mimeType: null,
            sasUrl: null,
        };
    }

    /**
     * @param {string} filename Value to set.
     * @returns {SasFileReferenceExtBuilder} This builder, for chaining.
     */
    WithFilename(filename) {
        this.request.filename = filename;

        return this;
    }

    /**
     * @param {string} mimeType Value to set.
     * @returns {SasFileReferenceExtBuilder} This builder, for chaining.
     */
    WithMimeType(mimeType) {
        this.request.mimeType = mimeType;

        return this;
    }

    /**
     * @param {string} sasUrl Value to set.
     * @returns {SasFileReferenceExtBuilder} This builder, for chaining.
     */
    WithSasUrl(sasUrl) {
        this.request.sasUrl = sasUrl;

        return this;
    }

    /**
     * @returns {SasFileReferenceExt} The built payload.
     */
    Build() {
        if (this.request.filename === null) {
            throw new Error("SasFileReferenceExt.filename is required");
        }

        if (this.request.mimeType === null) {
            throw new Error("SasFileReferenceExt.mimeType is required");
        }

        if (this.request.sasUrl === null) {
            throw new Error("SasFileReferenceExt.sasUrl is required");
        }

        return this.request;
    }
}

export {
    ComposedEmailRequestExtBuilder,
    ComposedEmailSendingOptionsExtBuilder,
    EmailSendingOptionsExtBuilder,
    NotificationOrderChainRequestExtBuilder,
    NotificationRecipientExtBuilder,
    RecipientComposedEmailExtBuilder,
    RecipientEmailExtBuilder,
    RecipientExternalIdentityExtBuilder,
    RecipientOrganizationExtBuilder,
    RecipientPersonExtBuilder,
    RecipientSmsExtBuilder,
    SasFileReferenceExtBuilder,
    SmsSendingOptionsExtBuilder
};
