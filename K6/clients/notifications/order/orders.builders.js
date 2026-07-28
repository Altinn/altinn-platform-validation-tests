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
     * @returns {NotificationOrderChainRequestExt} TODO: description
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
     * @param {string|null} sendersReference TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {NotificationRecipientExt} recipient TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
     */
    WithRecipient(recipient) {
        this.request.recipient = recipient;

        return this;
    }

    /**
     * @param {NotificationReminderExt[]} reminders TODO: description
     * @returns {NotificationOrderChainRequestExtBuilder} TODO: description
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
     * @returns {ComposedEmailRequestExt} TODO: description
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
     * @param {string|null} sendersReference TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {RecipientComposedEmailExt} recipient TODO: description
     * @returns {ComposedEmailRequestExtBuilder} TODO: description
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
     * @param {RecipientEmailExt} recipientEmail TODO: description
     * @returns {NotificationRecipientExtBuilder} TODO: description
     */
    WithRecipientEmail(recipientEmail) {
        this.request.recipientEmail = recipientEmail;

        return this;
    }

    /**
     * @param {RecipientSmsExt} recipientSms TODO: description
     * @returns {NotificationRecipientExtBuilder} TODO: description
     */
    WithRecipientSms(recipientSms) {
        this.request.recipientSms = recipientSms;

        return this;
    }

    /**
     * @param {RecipientPersonExt} recipientPerson TODO: description
     * @returns {NotificationRecipientExtBuilder} TODO: description
     */
    WithRecipientPerson(recipientPerson) {
        this.request.recipientPerson = recipientPerson;

        return this;
    }

    /**
     * @param {RecipientOrganizationExt} recipientOrganization TODO: description
     * @returns {NotificationRecipientExtBuilder} TODO: description
     */
    WithRecipientOrganization(recipientOrganization) {
        this.request.recipientOrganization = recipientOrganization;

        return this;
    }

    /**
     * @param {RecipientExternalIdentityExt} recipientExternalIdentity TODO: description
     * @returns {NotificationRecipientExtBuilder} TODO: description
     */
    WithRecipientExternalIdentity(recipientExternalIdentity) {
        this.request.recipientExternalIdentity = recipientExternalIdentity;

        return this;
    }

    /**
     * @returns {NotificationRecipientExt} TODO: description
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
     * @param {string} emailAddress TODO: description
     * @returns {RecipientEmailExtBuilder} TODO: description
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings TODO: description
     * @returns {RecipientEmailExtBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientEmailExt} TODO: description
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
     * @param {string} phoneNumber TODO: description
     * @returns {RecipientSmsExtBuilder} TODO: description
     */
    WithPhoneNumber(phoneNumber) {
        this.request.phoneNumber = phoneNumber;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings TODO: description
     * @returns {RecipientSmsExtBuilder} TODO: description
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @returns {RecipientSmsExt} TODO: description
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
     * @param {EmailSendingOptionsExt} emailSettings TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} nationalIdentityNumber TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithNationalIdentityNumber(nationalIdentityNumber) {
        this.request.nationalIdentityNumber = nationalIdentityNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @param {boolean|null} ignoreReservation TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithIgnoreReservation(ignoreReservation) {
        this.request.ignoreReservation = ignoreReservation;

        return this;
    }

    /**
     * @param {boolean|null} useStaleContactInformation TODO: description
     * @returns {RecipientPersonExtBuilder} TODO: description
     */
    WithUseStaleContactInformation(useStaleContactInformation) {
        this.request.useStaleContactInformation =
            useStaleContactInformation;

        return this;
    }

    /**
     * @returns {RecipientPersonExt} TODO: description
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
     * @param {EmailSendingOptionsExt} emailSettings TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} orgNumber TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithOrgNumber(orgNumber) {
        this.request.orgNumber = orgNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema TODO: description
     * @returns {RecipientOrganizationExtBuilder} TODO: description
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientOrganizationExt} TODO: description
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
     * @param {EmailSendingOptionsExt} emailSettings TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} externalIdentity TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithExternalIdentity(externalIdentity) {
        this.request.externalIdentity = externalIdentity;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema TODO: description
     * @returns {RecipientExternalIdentityExtBuilder} TODO: description
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientExternalIdentityExt} TODO: description
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
     * @param {string} emailAddress TODO: description
     * @returns {RecipientComposedEmailExtBuilder} TODO: description
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {ComposedEmailSendingOptionsExt} emailSettings TODO: description
     * @returns {RecipientComposedEmailExtBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientComposedEmailExt} TODO: description
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
     * @param {string|null} senderEmailAddress TODO: description
     * @returns {EmailSendingOptionsExtBuilder} TODO: description
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject TODO: description
     * @returns {EmailSendingOptionsExtBuilder} TODO: description
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body TODO: description
     * @returns {EmailSendingOptionsExtBuilder} TODO: description
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType TODO: description
     * @returns {EmailSendingOptionsExtBuilder} TODO: description
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy TODO: description
     * @returns {EmailSendingOptionsExtBuilder} TODO: description
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {EmailSendingOptionsExt} TODO: description
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
     * @param {string|null} sender TODO: description
     * @returns {SmsSendingOptionsExtBuilder} TODO: description
     */
    WithSender(sender) {
        this.request.sender = sender;

        return this;
    }

    /**
     * @param {string} body TODO: description
     * @returns {SmsSendingOptionsExtBuilder} TODO: description
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy TODO: description
     * @returns {SmsSendingOptionsExtBuilder} TODO: description
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {SmsSendingOptionsExt} TODO: description
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
     * @param {string|null} senderEmailAddress TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @param {SasFileReferenceExt[]} attachments TODO: description
     * @returns {ComposedEmailSendingOptionsExtBuilder} TODO: description
     */
    WithAttachments(attachments) {
        this.request.attachments = attachments;

        return this;
    }

    /**
     * @returns {ComposedEmailSendingOptionsExt} TODO: description
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
     * @param {string} filename TODO: description
     * @returns {SasFileReferenceExtBuilder} TODO: description
     */
    WithFilename(filename) {
        this.request.filename = filename;

        return this;
    }

    /**
     * @param {string} mimeType TODO: description
     * @returns {SasFileReferenceExtBuilder} TODO: description
     */
    WithMimeType(mimeType) {
        this.request.mimeType = mimeType;

        return this;
    }

    /**
     * @param {string} sasUrl TODO: description
     * @returns {SasFileReferenceExtBuilder} TODO: description
     */
    WithSasUrl(sasUrl) {
        this.request.sasUrl = sasUrl;

        return this;
    }

    /**
     * @returns {SasFileReferenceExt} TODO: description
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
