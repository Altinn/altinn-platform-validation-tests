class ShortMessageContentBuilder {
    constructor() {
        this.request = {
            sender: null,
            body: null,
        };
    }

    /**
     * @param {string} sender Value to set.
     * @returns {ShortMessageContentBuilder} This builder, for chaining.
     */
    WithSender(sender) {
        this.request.sender = sender;

        return this;
    }

    /**
     * @param {string} body Value to set.
     * @returns {ShortMessageContentBuilder} This builder, for chaining.
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @returns {ShortMessageContentExt} The built payload.
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
     * @param {string} phoneNumber Value to set.
     * @returns {ShortMessageDeliveryDetailsBuilder} This builder, for chaining.
     */
    WithPhoneNumber(phoneNumber) {
        this.request.phoneNumber = phoneNumber;

        return this;
    }

    /**
     * @param {number} timeToLiveInSeconds Value to set.
     * @returns {ShortMessageDeliveryDetailsBuilder} This builder, for chaining.
     */
    WithTimeToLiveInSeconds(timeToLiveInSeconds) {
        this.request.timeToLiveInSeconds = timeToLiveInSeconds;

        return this;
    }

    /**
     * @param {ShortMessageContentExt} smsSettings Value to set.
     * @returns {ShortMessageDeliveryDetailsBuilder} This builder, for chaining.
     */
    WithSmsSettings(smsSettings) {
        this.request.smsSettings = smsSettings;

        return this;
    }

    /**
     * @returns {ShortMessageDeliveryDetailsExt} The built payload.
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
     * @param {string} idempotencyId Value to set.
     * @returns {InstantSmsNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {string} sendersReference Value to set.
     * @returns {InstantSmsNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {ShortMessageDeliveryDetailsExt} recipientSms Value to set.
     * @returns {InstantSmsNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithRecipientSms(recipientSms) {
        this.request.recipientSms = recipientSms;

        return this;
    }

    /**
     * @returns {InstantSmsNotificationOrderRequestExt} The built payload.
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
     * @param {string} subject Value to set.
     * @returns {InstantEmailContentBuilder} This builder, for chaining.
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} body Value to set.
     * @returns {InstantEmailContentBuilder} This builder, for chaining.
     */
    WithBody(body) {
        this.request.body = body;

        return this;
    }

    /**
     * @param {string} senderEmailAddress Value to set.
     * @returns {InstantEmailContentBuilder} This builder, for chaining.
     */
    WithSenderEmailAddress(senderEmailAddress) {
        this.request.senderEmailAddress = senderEmailAddress;

        return this;
    }

    /**
     * @param {EmailContentType} contentType Value to set.
     * @returns {InstantEmailContentBuilder} This builder, for chaining.
     */
    WithContentType(contentType) {
        this.request.contentType = contentType;

        return this;
    }

    /**
     * @returns {InstantEmailContentExt} The built payload.
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
     * @param {string} emailAddress Value to set.
     * @returns {InstantEmailDetailsBuilder} This builder, for chaining.
     */
    WithEmailAddress(emailAddress) {
        this.request.emailAddress = emailAddress;

        return this;
    }

    /**
     * @param {InstantEmailContentExt} emailSettings Value to set.
     * @returns {InstantEmailDetailsBuilder} This builder, for chaining.
     */
    WithEmailSettings(emailSettings) {
        this.request.emailSettings = emailSettings;

        return this;
    }

    /**
     * @returns {InstantEmailDetailsExt} The built payload.
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
     * @param {string} idempotencyId Value to set.
     * @returns {InstantEmailNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithIdempotencyId(idempotencyId) {
        this.request.idempotencyId = idempotencyId;

        return this;
    }

    /**
     * @param {string} sendersReference Value to set.
     * @returns {InstantEmailNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithSendersReference(sendersReference) {
        this.request.sendersReference = sendersReference;

        return this;
    }

    /**
     * @param {InstantEmailDetailsExt} recipientEmail Value to set.
     * @returns {InstantEmailNotificationOrderRequestBuilder} This builder, for chaining.
     */
    WithRecipientEmail(recipientEmail) {
        this.request.recipientEmail = recipientEmail;

        return this;
    }

    /**
     * @returns {InstantEmailNotificationOrderRequestExt} The built payload.
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
