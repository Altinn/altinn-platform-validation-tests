import {
    EmailSendingOptionsExtBuilder,
    NotificationOrderChainRequestExtBuilder,
    NotificationRecipientExtBuilder,
    RecipientOrganizationExtBuilder,
    SmsSendingOptionsExtBuilder
} from "../../../../clients/notifications/order/index.js";
import { uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { OrderCreateOrder } from "../../../building-blocks/notifications/order/index.js";
import { OrderDomainChecks } from "../../../domain-checks/notifications/order.js";
import { getClients } from "./common.js";

export function setup() {
    requireEnv(
        [
            "ENVIRONMENT",
            "BASE_URL",
            "orgNoRecipient",
            "resourceId",
            "tokenGeneratorUserName",
            "tokenGeneratorUserPwd"
        ]
    );
    return;
}

function generateDomainObjects() {
    const uniqueIdentifier = uuidv4().substring(0, 8);
    const requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    const orderSendersReference = `k6-order-${uniqueIdentifier}`;
    const reminderSendersReference = `k6-reminder-${uniqueIdentifier}`;
    const orgNumber = __ENV.orgNoRecipient;
    const resourceId = __ENV.resourceId;

    /** @type {DialogportenIdentifiersExt} */
    const dialogportenAssociation = {
        dialogId: uniqueIdentifier,
        transmissionId: uniqueIdentifier
    };

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientOrganization(
            new RecipientOrganizationExtBuilder()
                .WithOrgNumber(orgNumber)
                .WithResourceId(resourceId)
                .WithChannelSchema("EmailPreferred")
                .WithSmsSettings(
                    new SmsSendingOptionsExtBuilder()
                        .WithSendingTimePolicy("Anytime")
                        .WithBody("Dear $recipientName$, please check your email for an important update regarding your account $recipientNumber$. - Altinn Team")
                        .Build()
                )
                .WithEmailSettings(
                    new EmailSendingOptionsExtBuilder()
                        .WithContentType("Html")
                        .WithSendingTimePolicy("Anytime")
                        .WithSubject("Important Update Regarding Your Account")
                        .WithBody("Dear $recipientName$,\n\nWe wanted to inform you about an important update to your account $recipientNumber$. Please log in to your dashboard to review the changes.\n\nBest regards,\nAltinn Team")
                        .Build()
                )
                .Build()
        )
        .Build();

    /** @type {NotificationReminderExt[]} */
    const reminders = [
        {
            delayDays: 1,
            sendersReference: `${reminderSendersReference}-1`,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientOrganization(
                    new RecipientOrganizationExtBuilder()
                        .WithOrgNumber(orgNumber)
                        .WithResourceId(resourceId)
                        .WithChannelSchema("Sms")
                        .WithSmsSettings(
                            new SmsSendingOptionsExtBuilder()
                                .WithSendingTimePolicy("Daytime")
                                .WithBody("REMINDER 1: Important update for $recipientNumber$. - Altinn")
                                .Build()
                        )
                        .Build()
                )
                .Build()
        },
        {
            delayDays: 3,
            sendersReference: `${reminderSendersReference}-2`,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientOrganization(
                    new RecipientOrganizationExtBuilder()
                        .WithOrgNumber(orgNumber)
                        .WithResourceId(resourceId)
                        .WithChannelSchema("Email")
                        .WithEmailSettings(
                            new EmailSendingOptionsExtBuilder()
                                .WithContentType("Plain")
                                .WithSendingTimePolicy("Anytime")
                                .WithSubject("Reminder 2: Important Update Regarding Your Account")
                                .WithBody("Dear $recipientName$,\n\nThis is your second reminder about an important update to your account $recipientNumber$.\n\nBest regards,\nAltinn Team")
                                .Build()
                        )
                        .Build()
                )
                .Build()
        },
        {
            delayDays: 5,
            sendersReference: `${reminderSendersReference}-3`,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientOrganization(
                    new RecipientOrganizationExtBuilder()
                        .WithOrgNumber(orgNumber)
                        .WithResourceId(resourceId)
                        .WithChannelSchema("EmailAndSms")
                        .WithSmsSettings(
                            new SmsSendingOptionsExtBuilder()
                                .WithSendingTimePolicy("Daytime")
                                .WithBody("REMINDER 3: Important update for account $recipientNumber$. - Altinn")
                                .Build()
                        )
                        .WithEmailSettings(
                            new EmailSendingOptionsExtBuilder()
                                .WithContentType("Plain")
                                .WithSendingTimePolicy("Anytime")
                                .WithSubject("Reminder 3: Important Update Regarding Your Account")
                                .WithBody("Dear $recipientName$,\n\nThis is your third reminder about an important update to your account $recipientNumber$.\n\nBest regards,\nAltinn Team")
                                .Build()
                        )
                        .Build()
                )
                .Build()
        },
        {
            delayDays: 7,
            sendersReference: `${reminderSendersReference}-4`,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientOrganization(
                    new RecipientOrganizationExtBuilder()
                        .WithOrgNumber(orgNumber)
                        .WithResourceId(resourceId)
                        .WithChannelSchema("SmsPreferred")
                        .WithSmsSettings(
                            new SmsSendingOptionsExtBuilder()
                                .WithSendingTimePolicy("Daytime")
                                .WithBody("FINAL REMINDER: Important update for account $recipientNumber$. - Altinn")
                                .Build()
                        )
                        .WithEmailSettings(
                            new EmailSendingOptionsExtBuilder()
                                .WithContentType("Plain")
                                .WithSendingTimePolicy("Anytime")
                                .WithSubject("FINAL REMINDER: Important Update Regarding Your Account")
                                .WithBody("Dear $recipientName$,\n\nThis is your fourth reminder about an important update to your account $recipientNumber$.\n\nBest regards,\nAltinn Team")
                                .Build()
                        )
                        .Build()
                )
                .Build()
        }
    ];

    /** @type {NotificationOrderChainRequestExt} */
    const request = new NotificationOrderChainRequestExtBuilder()
        .WithIdempotencyId(uuidv4())
        .WithRequestedSendTime(requestedSendTime)
        .WithSendersReference(orderSendersReference)
        .WithRecipient(recipient)
        .WithDialogportenAssociation(dialogportenAssociation)
        .WithReminders(reminders)
        .Build();

    return [request, reminders];
}

export default function () {

    const [ordersApiClient] = getClients();

    const [request, reminders] = generateDomainObjects();

    const response = OrderCreateOrder(ordersApiClient, request);

    OrderDomainChecks.CheckResponseContainsShipmentID(response);
    OrderDomainChecks.CheckResponseContainsNotificationOrderID(response);
    OrderDomainChecks.CheckResponseContainsReminders(response);
    OrderDomainChecks.CheckResponseRemindersCountMatchesRequests(response, reminders.length);
    OrderDomainChecks.CheckResponseRemindersAllContainShipmentIDs(response);

}
