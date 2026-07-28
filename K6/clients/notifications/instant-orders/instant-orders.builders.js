class ShortMessageContentBuilder {
    constructor() {
        this.request = {
            sender: null,
            body: null,
        };
    }

    /**
     * @param {string} sender TODO: description
     * @returns {ShortMessageContentBuilder} TODO: description
     */
    WithSender(sender) {
        this.request.sender = sender;

        return this;
    }

    /**
     * @param {string} body TODO: description
     * @returns {ShortMessageContentBuilder} TODO: description
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @returns {ShortMessageContentExt} TODO: description
     */
    Build() {
        if (this.request.body === null) {
            throw new Error("ShortMessageContentExt.body is required");
        }

        return this.request;
    }
}

class ShortMessageDeliveryDetailsBuilder {
    constructor() {
        this.request = {
            phoneNumber: null,
            timeToLiveInSeconds: null,
            smsSettings: null,
        };
    }

    /**
     * @param {string} phoneNumber TODO: description
     * @returns {ShortMessageDeliveryDetailsBuilder} TODO: description
     */
    WithPhoneNumber(phoneNumber) {
        this.request.phoneNumber = phoneNumber;

        return this;
    }

    /**
     * @param {number} timeToLiveInSeconds TODO: description
     * @returns {ShortMessageDeliveryDetailsBuilder} TODO: description
     */
    WithTimeToLiveInSeconds(timeToLiveInSeconds) {
        this.request.timeToLiveInSeconds = timeToLiveInSeconds;

        return this;
    }

    /**
     * @param {ShortMessageContentExt} smsSettings TODO: description
     * @returns {ShortMessageDeliveryDetailsBuilder} TODO: description
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @returns {ShortMessageDeliveryDetailsExt} TODO: description
     */
    Build() {
        if (this.request.phoneNumber === null) {
            throw new Error(
                "ShortMessageDeliveryDetailsExt.phoneNumber is required",
            );
        }

        if (this.request.timeToLiveInSeconds === null) {
            throw new Error(
                "ShortMessageDeliveryDetailsExt.timeToLiveInSeconds is required",
            );
        }

        if (this.request.smsSettings === null) {
            throw new Error(
                "ShortMessageDeliveryDetailsExt.smsSettings is required",
            );
        }

        return this.request;
    }
}

/**
 * Example:
 *
 * const request = new InstantSmsNotificationOrderRequestBuilder()
 * .WithIdempotencyId(idempotencyId)
 * .WithRecipientSms(
 * new ShortMessageDeliveryDetailsBuilder()
 * .WithPhoneNumber("+4799999999")
 * .WithTimeToLiveInSeconds(3600)
 * .WithSmsSettings(
 * new ShortMessageContentBuilder()
 * .WithBody("Hello!")
 * .Build(),
 * )
 * .Build(),
 * )
 * .Build();
 */
class InstantSmsNotificationOrderRequestBuilder {
    constructor() {
        this.request = {
            idempotencyId: null,
            sendersReference: null,
            recipientSms: null,
        };
    }

    /**
     * @param {string} idempotencyId TODO: description
     * @returns {InstantSmsNotificationOrderRequestBuilder} TODO: description
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {string} sendersReference TODO: description
     * @returns {InstantSmsNotificationOrderRequestBuilder} TODO: description
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {ShortMessageDeliveryDetailsExt} recipientSms TODO: description
     * @returns {InstantSmsNotificationOrderRequestBuilder} TODO: description
     */
    WithRecipientSms(recipientSms) {
        this.request.recipientSms = recipientSms;

        return this;
    }

    /**
     * @returns {InstantSmsNotificationOrderRequestExt} TODO: description
     */
    Build() {
        if (this.request.idempotencyId === null) {
            throw new Error(
                "InstantSmsNotificationOrderRequestExt.idempotencyId is required",
            );
        }

        if (this.request.recipientSms === null) {
            throw new Error(
                "InstantSmsNotificationOrderRequestExt.recipientSms is required",
            );
        }

        return this.request;
    }
}

class InstantEmailContentBuilder {
    constructor() {
        this.request = {
            subject: null,
            body: null,
            senderEmailAddress: null,
            contentType: null,
        };
    }

    /**
     * @param {string} subject TODO: description
     * @returns {InstantEmailContentBuilder} TODO: description
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body TODO: description
     * @returns {InstantEmailContentBuilder} TODO: description
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {string} senderEmailAddress TODO: description
     * @returns {InstantEmailContentBuilder} TODO: description
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {EmailContentType} contentType TODO: description
     * @returns {InstantEmailContentBuilder} TODO: description
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @returns {InstantEmailContentExt} TODO: description
     */
    Build() {
        if (this.request.subject === null) {
            throw new Error("InstantEmailContentExt.subject is required");
        }

        if (this.request.body === null) {
            throw new Error("InstantEmailContentExt.body is required");
        }

        return this.request;
    }
}

class InstantEmailDetailsBuilder {
    constructor() {
        this.request = {
            emailAddress: null,
            emailSettings: null,
        };
    }

    /**
     * @param {string} emailAddress TODO: description
     * @returns {InstantEmailDetailsBuilder} TODO: description
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {InstantEmailContentExt} emailSettings TODO: description
     * @returns {InstantEmailDetailsBuilder} TODO: description
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {InstantEmailDetailsExt} TODO: description
     */
    Build() {
        if (this.request.emailAddress === null) {
            throw new Error("InstantEmailDetailsExt.emailAddress is required");
        }

        if (this.request.emailSettings === null) {
            throw new Error("InstantEmailDetailsExt.emailSettings is required");
        }

        return this.request;
    }
}

/**
 * Example:
 *
 * const request = new InstantEmailNotificationOrderRequestBuilder()
 * .WithIdempotencyId(idempotencyId)
 * .WithRecipientEmail(
 * new InstantEmailDetailsBuilder()
 * .WithEmailAddress("user@example.com")
 * .WithEmailSettings(
 * new InstantEmailContentBuilder()
 * .WithSubject("Subject")
 * .WithBody("Body")
 * .Build(),
 * )
 * .Build(),
 * )
 * .Build();
 */
class InstantEmailNotificationOrderRequestBuilder {
    constructor() {
        this.request = {
            idempotencyId: null,
            sendersReference: null,
            recipientEmail: null,
        };
    }

    /**
     * @param {string} idempotencyId TODO: description
     * @returns {InstantEmailNotificationOrderRequestBuilder} TODO: description
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {string} sendersReference TODO: description
     * @returns {InstantEmailNotificationOrderRequestBuilder} TODO: description
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {InstantEmailDetailsExt} recipientEmail TODO: description
     * @returns {InstantEmailNotificationOrderRequestBuilder} TODO: description
     */
    WithRecipientEmail(recipientEmail) {
        this.request.recipientEmail = recipientEmail;

        return this;
    }

    /**
     * @returns {InstantEmailNotificationOrderRequestExt} TODO: description
     */
    Build() {
        if (this.request.idempotencyId === null) {
            throw new Error(
                "InstantEmailNotificationOrderRequestExt.idempotencyId is required",
            );
        }

        if (this.request.recipientEmail === null) {
            throw new Error(
                "InstantEmailNotificationOrderRequestExt.recipientEmail is required",
            );
        }

        return this.request;
    }
}

export {
    InstantEmailContentBuilder,
    InstantEmailDetailsBuilder,
    InstantEmailNotificationOrderRequestBuilder,
    InstantSmsNotificationOrderRequestBuilder,
    ShortMessageContentBuilder,
    ShortMessageDeliveryDetailsBuilder,
};
