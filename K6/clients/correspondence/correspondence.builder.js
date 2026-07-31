/**
 * Builder for CorrespondenceQuery.
 *
 * Used for constructing query parameters for:
 * GET /correspondence/api/v1/correspondence
 */
class CorrespondenceQueryBuilder {
    constructor() {
        this.query = {
            resourceId: null,
            from: null,
            to: null,
            status: null,
            role: null,
            onBehalfOf: null,
            sendersReference: null,
            idempotentKey: null,
            altinn2CorrespondenceId: null,
        };
    }

    /**
     * @param {string} resourceId See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * @param {string} from ISO date-time
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * @param {string} to ISO date-time
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * @param {CorrespondenceStatusExt} status See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * @param {CorrespondencesRoleType} role See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withRole(role) {
        this.query.role = role;
        return this;
    }

    /**
     * @param {string} onBehalfOf See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withOnBehalfOf(onBehalfOf) {
        this.query.onBehalfOf = onBehalfOf;
        return this;
    }

    /**
     * @param {string} sendersReference See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withSendersReference(sendersReference) {
        this.query.sendersReference = sendersReference;
        return this;
    }

    /**
     * @param {string} idempotentKey UUID
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withIdempotentKey(idempotentKey) {
        this.query.idempotentKey = idempotentKey;
        return this;
    }

    /**
     * @param {number} altinn2CorrespondenceId See the client method.
     * @returns {CorrespondenceQueryBuilder} This builder, for chaining.
     */
    withAltinn2CorrespondenceId(altinn2CorrespondenceId) {
        this.query.altinn2CorrespondenceId = altinn2CorrespondenceId;
        return this;
    }

    /**
     * @returns {CorrespondenceQuery} The built payload.
     */
    build() {
        if (
            this.query.from !== null &&
            this.query.to !== null &&
            new Date(this.query.from) > new Date(this.query.to)
        ) {
            throw new Error(
                "CorrespondenceQuery: from cannot be after to",
            );
        }

        return this.query;
    }
}

/**
 * Builder for InitializeCorrespondencesExt.
 *
 * Creates the request body used when initializing correspondence.
 *
 * Required:
 * - correspondence
 * - recipients
 */
class InitializeCorrespondencesBuilder {
    constructor() {
        this.model = {
            correspondence: null,
            recipients: null,
            existingAttachments: null,
            idempotentKey: null,
        };
    }

    /**
     * @param {BaseCorrespondenceExt} correspondence See the client method.
     * @returns {InitializeCorrespondencesBuilder} This builder, for chaining.
     */
    withCorrespondence(correspondence) {
        this.model.correspondence = correspondence;
        return this;
    }

    /**
     * @param {Array<string>} recipients See the client method.
     * @returns {InitializeCorrespondencesBuilder} This builder, for chaining.
     */
    withRecipients(recipients) {
        this.model.recipients = recipients;
        return this;
    }

    /**
     * @param {Array<string>} attachmentIds See the client method.
     * @returns {InitializeCorrespondencesBuilder} This builder, for chaining.
     */
    withExistingAttachments(attachmentIds) {
        this.model.existingAttachments = attachmentIds;
        return this;
    }

    /**
     * @param {string} idempotentKey See the client method.
     * @returns {InitializeCorrespondencesBuilder} This builder, for chaining.
     */
    withIdempotentKey(idempotentKey) {
        this.model.idempotentKey = idempotentKey;
        return this;
    }

    /**
     * Builds InitializeCorrespondencesExt.
     *
     * @returns {InitializeCorrespondencesExt} The built payload.
     */
    build() {
        if (this.model.correspondence === null) {
            throw new Error(
                "InitializeCorrespondences requires correspondence",
            );
        }

        if (
            this.model.recipients === null ||
            this.model.recipients.length === 0
        ) {
            throw new Error(
                "InitializeCorrespondences requires at least one recipient",
            );
        }

        if (
            this.model.idempotentKey !== null &&
            !this.isGuid(this.model.idempotentKey)
        ) {
            throw new Error(
                "InitializeCorrespondences idempotentKey must be a valid UUID",
            );
        }

        return {
            correspondence: this.model.correspondence,
            recipients: this.model.recipients,
            existingAttachments: this.model.existingAttachments,
            idempotentKey: this.model.idempotentKey,
        };
    }

    /**
     * @param {string} value See the client method.
     * @returns {boolean} The built payload.
     */
    isGuid(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value,
        );
    }
}

/**
 * Builder for BaseCorrespondenceExt.
 *
 * Represents the core correspondence information used when
 * initializing a correspondence.
 */
class BaseCorrespondenceBuilder {
    constructor() {
        this.model = {
            resourceId: null,
            sendersReference: null,
            messageSender: null,
            content: null,
            requestedPublishTime: null,
            dueDateTime: null,
            externalReferences: null,
            propertyList: null,
            replyOptions: null,
            notification: null,
            ignoreReservation: null,
            isConfirmationNeeded: false,
            isConfidential: false,
        };
    }

    /**
     * @param {string} resourceId See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.model.resourceId = resourceId;
        return this;
    }

    /**
     * @param {string} sendersReference See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withSendersReference(sendersReference) {
        this.model.sendersReference = sendersReference;
        return this;
    }

    /**
     * @param {string} messageSender See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withMessageSender(messageSender) {
        this.model.messageSender = messageSender;
        return this;
    }

    /**
     * @param {CorrespondenceContentExt} content See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withContent(content) {
        this.model.content = content;
        return this;
    }

    /**
     * @param {string} requestedPublishTime ISO date-time
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withRequestedPublishTime(requestedPublishTime) {
        this.model.requestedPublishTime = requestedPublishTime;
        return this;
    }

    /**
     * @param {string} dueDateTime ISO date-time
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withDueDateTime(dueDateTime) {
        this.model.dueDateTime = dueDateTime;
        return this;
    }

    /**
     * @param {Array<ExternalReferenceExt>} references See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withExternalReferences(references) {
        this.model.externalReferences = references;
        return this;
    }

    /**
     * @param {{[key:string]:string}} properties See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withPropertyList(properties) {
        this.model.propertyList = properties;
        return this;
    }

    /**
     * @param {Array<CorrespondenceReplyOptionExt>} replyOptions See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withReplyOptions(replyOptions) {
        this.model.replyOptions = replyOptions;
        return this;
    }

    /**
     * @param {InitializeCorrespondenceNotificationExt} notification See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withNotification(notification) {
        this.model.notification = notification;
        return this;
    }

    /**
     * @param {boolean} ignoreReservation See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withIgnoreReservation(ignoreReservation) {
        this.model.ignoreReservation = ignoreReservation;
        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withConfirmationNeeded(value) {
        this.model.isConfirmationNeeded = value;
        return this;
    }

    /**
     * @param {boolean} value See the client method.
     * @returns {BaseCorrespondenceBuilder} This builder, for chaining.
     */
    withConfidential(value) {
        this.model.isConfidential = value;
        return this;
    }

    /**
     * @returns {BaseCorrespondenceExt} The built payload.
     */
    build() {
        if (!this.model.resourceId) {
            throw new Error(
                "BaseCorrespondence requires resourceId",
            );
        }

        if (!this.model.sendersReference) {
            throw new Error(
                "BaseCorrespondence requires sendersReference",
            );
        }

        if (!this.model.content) {
            throw new Error(
                "BaseCorrespondence requires content",
            );
        }

        return {
            resourceId: this.model.resourceId,
            sendersReference: this.model.sendersReference,
            messageSender: this.model.messageSender,
            content: this.model.content,
            requestedPublishTime: this.model.requestedPublishTime,
            dueDateTime: this.model.dueDateTime,
            externalReferences: this.model.externalReferences,
            propertyList: this.model.propertyList,
            replyOptions: this.model.replyOptions,
            notification: this.model.notification,
            ignoreReservation: this.model.ignoreReservation,
            isConfirmationNeeded: this.model.isConfirmationNeeded,
            isConfidential: this.model.isConfidential,
        };
    }
}

/**
 * Builder for InitializeCorrespondenceNotificationExt.
 *
 * Builds notification configuration for a correspondence initialization request.
 */
class NotificationBuilder {
    constructor() {
        this.model = {
            notificationTemplate: null,
            emailSubject: null,
            emailBody: null,
            emailContentType: null,
            smsBody: null,
            sendReminder: false,
            reminderEmailSubject: null,
            reminderEmailBody: null,
            reminderEmailContentType: null,
            reminderSmsBody: null,
            notificationChannel: null,
            reminderNotificationChannel: null,
            sendersReference: null,
            customRecipients: null,
            customRecipient: null,
            customNotificationRecipients: null,
            overrideRegisteredContactInformation: false,
        };
    }

    /**
     * @param {NotificationTemplateExt} template See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withNotificationTemplate(template) {
        this.model.notificationTemplate = template;
        return this;
    }

    /**
     * @param {string} subject See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withEmailSubject(subject) {
        this.model.emailSubject = subject;
        return this;
    }

    /**
     * @param {string} body See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withEmailBody(body) {
        this.model.emailBody = body;
        return this;
    }

    /**
     * @param {EmailContentType} contentType See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withEmailContentType(contentType) {
        this.model.emailContentType = contentType;
        return this;
    }

    /**
     * @param {string} body See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withSmsBody(body) {
        this.model.smsBody = body;
        return this;
    }

    /**
     * @param {boolean} sendReminder See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withSendReminder(sendReminder) {
        this.model.sendReminder = sendReminder;
        return this;
    }

    /**
     * @param {string} subject See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withReminderEmailSubject(subject) {
        this.model.reminderEmailSubject = subject;
        return this;
    }

    /**
     * @param {string} body See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withReminderEmailBody(body) {
        this.model.reminderEmailBody = body;
        return this;
    }

    /**
     * @param {EmailContentType} contentType See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withReminderEmailContentType(contentType) {
        this.model.reminderEmailContentType = contentType;
        return this;
    }

    /**
     * @param {string} body See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withReminderSmsBody(body) {
        this.model.reminderSmsBody = body;
        return this;
    }

    /**
     * @param {NotificationChannelExt} channel See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withNotificationChannel(channel) {
        this.model.notificationChannel = channel;
        return this;
    }

    /**
     * @param {NotificationChannelExt} channel See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withReminderNotificationChannel(channel) {
        this.model.reminderNotificationChannel = channel;
        return this;
    }

    /**
     * @param {string} sendersReference See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withSendersReference(sendersReference) {
        this.model.sendersReference = sendersReference;
        return this;
    }

    /**
     * @param {Array<NotificationRecipientExt>} recipients See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withCustomRecipients(recipients) {
        this.model.customRecipients = recipients;
        return this;
    }

    /**
     * @param {NotificationRecipientExt} recipient See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withCustomRecipient(recipient) {
        this.model.customRecipient = recipient;
        return this;
    }

    /**
     * @param {Array<CustomNotificationRecipientExt>} recipients See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withCustomNotificationRecipients(recipients) {
        this.model.customNotificationRecipients = recipients;
        return this;
    }

    /**
     * @param {boolean} override See the client method.
     * @returns {NotificationBuilder} This builder, for chaining.
     */
    withOverrideRegisteredContactInformation(override) {
        this.model.overrideRegisteredContactInformation = override;
        return this;
    }

    /**
     * Builds InitializeCorrespondenceNotificationExt.
     *
     * @returns {InitializeCorrespondenceNotificationExt} The built payload.
     */
    build() {
        if (
            this.model.overrideRegisteredContactInformation &&
            this.model.customRecipients === null
        ) {
            throw new Error(
                "overrideRegisteredContactInformation requires customRecipients",
            );
        }

        if (
            this.model.emailSubject !== null &&
            this.model.emailSubject.length > 512
        ) {
            throw new Error(
                "emailSubject cannot exceed 512 characters",
            );
        }

        if (
            this.model.emailBody !== null &&
            this.model.emailBody.length > 10000
        ) {
            throw new Error(
                "emailBody cannot exceed 10000 characters",
            );
        }

        if (
            this.model.smsBody !== null &&
            this.model.smsBody.length > 2144
        ) {
            throw new Error(
                "smsBody cannot exceed 2144 characters",
            );
        }

        if (
            this.model.reminderEmailSubject !== null &&
            this.model.reminderEmailSubject.length > 512
        ) {
            throw new Error(
                "reminderEmailSubject cannot exceed 512 characters",
            );
        }

        if (
            this.model.reminderEmailBody !== null &&
            this.model.reminderEmailBody.length > 10000
        ) {
            throw new Error(
                "reminderEmailBody cannot exceed 10000 characters",
            );
        }

        if (
            this.model.reminderSmsBody !== null &&
            this.model.reminderSmsBody.length > 2144
        ) {
            throw new Error(
                "reminderSmsBody cannot exceed 2144 characters",
            );
        }

        return {
            notificationTemplate: this.model.notificationTemplate,
            emailSubject: this.model.emailSubject,
            emailBody: this.model.emailBody,
            emailContentType: this.model.emailContentType,
            smsBody: this.model.smsBody,
            sendReminder: this.model.sendReminder,
            reminderEmailSubject: this.model.reminderEmailSubject,
            reminderEmailBody: this.model.reminderEmailBody,
            reminderEmailContentType:
                this.model.reminderEmailContentType,
            reminderSmsBody: this.model.reminderSmsBody,
            notificationChannel: this.model.notificationChannel,
            reminderNotificationChannel:
                this.model.reminderNotificationChannel,
            sendersReference: this.model.sendersReference,
            customRecipients: this.model.customRecipients,
            customRecipient: this.model.customRecipient,
            customNotificationRecipients:
                this.model.customNotificationRecipients,
            overrideRegisteredContactInformation:
                this.model.overrideRegisteredContactInformation,
        };
    }
}

export {
    BaseCorrespondenceBuilder,
    CorrespondenceQueryBuilder,
    InitializeCorrespondencesBuilder,
    NotificationBuilder
};
