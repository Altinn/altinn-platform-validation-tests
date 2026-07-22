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
     *     .WithIdempotencyId("order-123")
     *     .WithRecipient({
     *         recipientEmail: {
     *             emailAddress: "recipient@example.com",
     *             emailSettings: {
     *                 subject: "Subject",
     *                 body: "Body",
     *             },
     *         },
     *     })
     *     .Build();
     *
     * @returns {NotificationOrderChainRequestExt}
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
     * @param {string|null} sendersReference
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {NotificationRecipientExt} recipient
     * @returns {NotificationOrderChainRequestExtBuilder}
     */
    WithRecipient(recipient) {
        this.request.recipient = recipient;

        return this;
    }

    /**
     * @param {NotificationReminderExt[]} reminders
     * @returns {NotificationOrderChainRequestExtBuilder}
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
     *     .WithIdempotencyId("order-123")
     *     .WithRecipient({
     *         emailAddress: "recipient@example.com",
     *         emailSettings: {
     *             subject: "Subject",
     *             body: "Body",
     *             attachments: [],
     *         },
     *     })
     *     .Build();
     *
     * @returns {ComposedEmailRequestExt}
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
     * @param {string|null} sendersReference
     * @returns {ComposedEmailRequestExtBuilder}
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {string} requestedSendTime
     * @returns {ComposedEmailRequestExtBuilder}
     */
    WithRequestedSendTime(requestedSendTime) {
        this.request.requestedSendTime = requestedSendTime;

        return this;
    }

    /**
     * @param {string|null} conditionEndpoint
     * @returns {ComposedEmailRequestExtBuilder}
     */
    WithConditionEndpoint(conditionEndpoint) {
        this.request.conditionEndpoint = conditionEndpoint;

        return this;
    }

    /**
     * @param {DialogportenIdentifiersExt} dialogportenAssociation
     * @returns {ComposedEmailRequestExtBuilder}
     */
    WithDialogportenAssociation(dialogportenAssociation) {
        this.request.dialogportenAssociation = dialogportenAssociation;

        return this;
    }

    /**
     * @param {string} idempotencyId
     * @returns {ComposedEmailRequestExtBuilder}
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {RecipientComposedEmailExt} recipient
     * @returns {ComposedEmailRequestExtBuilder}
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
     * @param {RecipientEmailExt} recipientEmail
     * @returns {NotificationRecipientExtBuilder}
     */
    WithRecipientEmail(recipientEmail) {
        this.request.recipientEmail = recipientEmail;

        return this;
    }

    /**
     * @param {RecipientSmsExt} recipientSms
     * @returns {NotificationRecipientExtBuilder}
     */
    WithRecipientSms(recipientSms) {
        this.request.recipientSms = recipientSms;

        return this;
    }

    /**
     * @param {RecipientPersonExt} recipientPerson
     * @returns {NotificationRecipientExtBuilder}
     */
    WithRecipientPerson(recipientPerson) {
        this.request.recipientPerson = recipientPerson;

        return this;
    }

    /**
     * @param {RecipientOrganizationExt} recipientOrganization
     * @returns {NotificationRecipientExtBuilder}
     */
    WithRecipientOrganization(recipientOrganization) {
        this.request.recipientOrganization = recipientOrganization;

        return this;
    }

    /**
     * @param {RecipientExternalIdentityExt} recipientExternalIdentity
     * @returns {NotificationRecipientExtBuilder}
     */
    WithRecipientExternalIdentity(recipientExternalIdentity) {
        this.request.recipientExternalIdentity = recipientExternalIdentity;

        return this;
    }

    /**
     * @returns {NotificationRecipientExt}
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
     * @param {string} emailAddress
     * @returns {RecipientEmailExtBuilder}
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {EmailSendingOptionsExt} emailSettings
     * @returns {RecipientEmailExtBuilder}
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientEmailExt}
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
     * @param {string} phoneNumber
     * @returns {RecipientSmsExtBuilder}
     */
    WithPhoneNumber(phoneNumber) {
        this.request.phoneNumber = phoneNumber;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings
     * @returns {RecipientSmsExtBuilder}
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @returns {RecipientSmsExt}
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
     * @param {EmailSendingOptionsExt} emailSettings
     * @returns {RecipientPersonExtBuilder}
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings
     * @returns {RecipientPersonExtBuilder}
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId
     * @returns {RecipientPersonExtBuilder}
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction
     * @returns {RecipientPersonExtBuilder}
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} nationalIdentityNumber
     * @returns {RecipientPersonExtBuilder}
     */
    WithNationalIdentityNumber(nationalIdentityNumber) {
        this.request.nationalIdentityNumber = nationalIdentityNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema
     * @returns {RecipientPersonExtBuilder}
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @param {boolean|null} ignoreReservation
     * @returns {RecipientPersonExtBuilder}
     */
    WithIgnoreReservation(ignoreReservation) {
        this.request.ignoreReservation = ignoreReservation;

        return this;
    }

    /**
     * @param {boolean|null} useStaleContactInformation
     * @returns {RecipientPersonExtBuilder}
     */
    WithUseStaleContactInformation(useStaleContactInformation) {
        this.request.useStaleContactInformation =
            useStaleContactInformation;

        return this;
    }

    /**
     * @returns {RecipientPersonExt}
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
     * @param {EmailSendingOptionsExt} emailSettings
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} orgNumber
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithOrgNumber(orgNumber) {
        this.request.orgNumber = orgNumber;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema
     * @returns {RecipientOrganizationExtBuilder}
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientOrganizationExt}
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
     * @param {EmailSendingOptionsExt} emailSettings
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @param {SmsSendingOptionsExt} smsSettings
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @param {string|null} resourceId
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithResourceId(resourceId) {
        this.request.resourceId = resourceId;

        return this;
    }

    /**
     * @param {string|null} resourceAction
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithResourceAction(resourceAction) {
        this.request.resourceAction = resourceAction;

        return this;
    }

    /**
     * @param {string} externalIdentity
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithExternalIdentity(externalIdentity) {
        this.request.externalIdentity = externalIdentity;

        return this;
    }

    /**
     * @param {ChannelSchema} channelSchema
     * @returns {RecipientExternalIdentityExtBuilder}
     */
    WithChannelSchema(channelSchema) {
        this.request.channelSchema = channelSchema;

        return this;
    }

    /**
     * @returns {RecipientExternalIdentityExt}
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
     * @param {string} emailAddress
     * @returns {RecipientComposedEmailExtBuilder}
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {ComposedEmailSendingOptionsExt} emailSettings
     * @returns {RecipientComposedEmailExtBuilder}
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {RecipientComposedEmailExt}
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
     * @param {string|null} senderEmailAddress
     * @returns {EmailSendingOptionsExtBuilder}
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject
     * @returns {EmailSendingOptionsExtBuilder}
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body
     * @returns {EmailSendingOptionsExtBuilder}
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType
     * @returns {EmailSendingOptionsExtBuilder}
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy
     * @returns {EmailSendingOptionsExtBuilder}
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {EmailSendingOptionsExt}
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
     * @param {string|null} sender
     * @returns {SmsSendingOptionsExtBuilder}
     */
    WithSender(sender) {
        this.request.sender = sender;

        return this;
    }

    /**
     * @param {string} body
     * @returns {SmsSendingOptionsExtBuilder}
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy
     * @returns {SmsSendingOptionsExtBuilder}
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @returns {SmsSendingOptionsExt}
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
     * @param {string|null} senderEmailAddress
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {string} subject
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {EmailContentType} contentType
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @param {SendingTimePolicy} sendingTimePolicy
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithSendingTimePolicy(sendingTimePolicy) {
        this.request.sendingTimePolicy = sendingTimePolicy;

        return this;
    }

    /**
     * @param {SasFileReferenceExt[]} attachments
     * @returns {ComposedEmailSendingOptionsExtBuilder}
     */
    WithAttachments(attachments) {
        this.request.attachments = attachments;

        return this;
    }

    /**
     * @returns {ComposedEmailSendingOptionsExt}
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
     * @param {string} filename
     * @returns {SasFileReferenceExtBuilder}
     */
    WithFilename(filename) {
        this.request.filename = filename;

        return this;
    }

    /**
     * @param {string} mimeType
     * @returns {SasFileReferenceExtBuilder}
     */
    WithMimeType(mimeType) {
        this.request.mimeType = mimeType;

        return this;
    }

    /**
     * @param {string} sasUrl
     * @returns {SasFileReferenceExtBuilder}
     */
    WithSasUrl(sasUrl) {
        this.request.sasUrl = sasUrl;

        return this;
    }

    /**
     * @returns {SasFileReferenceExt}
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
    EmailSendingOptionsExtBuilder,
    ComposedEmailSendingOptionsExtBuilder,
    SasFileReferenceExtBuilder,
    SmsSendingOptionsExtBuilder,
    NotificationOrderChainRequestExtBuilder,
    RecipientPersonExtBuilder,
    RecipientSmsExtBuilder,
    RecipientEmailExtBuilder,
    RecipientOrganizationExtBuilder,
    NotificationRecipientExtBuilder,
    RecipientExternalIdentityExtBuilder,
    RecipientComposedEmailExtBuilder
};
