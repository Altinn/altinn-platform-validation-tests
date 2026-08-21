import {
    EmailSendingOptionsExtBuilder,
    NotificationOrderChainRequestExtBuilder,
    NotificationRecipientExtBuilder,
    RecipientPersonExtBuilder,
    SmsSendingOptionsExtBuilder
} from "../../../../clients/notifications/order/index.js";
import { DialogportenIdentifiersExt, NotificationOrderChainRequestExt, NotificationReminderExt } from "../../../../clients/notifications/types.js";
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
            "ninRecipient",
        ]
    );
    return;
}

function generateDomainObjects() {
    const uniqueIdentifier = uuidv4().substring(0, 8);
    const requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    const orderSendersReference = `k6-order-${uniqueIdentifier}`;
    const reminderSendersReference = `k6-reminder-${uniqueIdentifier}`;
    const nationalIdentityNumber = __ENV.ninRecipient;

    /** @type {DialogportenIdentifiersExt} */
    const dialogportenAssociation = {
        dialogId: uniqueIdentifier,
        transmissionId: uniqueIdentifier
    };

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientPerson(
            new RecipientPersonExtBuilder()
                .WithNationalIdentityNumber(nationalIdentityNumber)
                .WithIgnoreReservation(true)
                .WithChannelSchema("EmailPreferred")
                .WithSmsSettings(
                    new SmsSendingOptionsExtBuilder()
                        .WithSendingTimePolicy("Daytime")
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
            delayDays: 15,
            sendersReference: reminderSendersReference,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientPerson(
                    new RecipientPersonExtBuilder()
                        .WithNationalIdentityNumber(nationalIdentityNumber)
                        .WithIgnoreReservation(true)
                        .WithChannelSchema("SmsPreferred")
                        .WithSmsSettings(
                            new SmsSendingOptionsExtBuilder()
                                .WithSendingTimePolicy("Daytime")
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
                .Build()
        }
    ];

    /** @type {NotificationOrderChainRequestExt} */
    const request = new NotificationOrderChainRequestExtBuilder()
        .WithIdempotencyId(uuidv4())
        .WithDialogportenAssociation(dialogportenAssociation)
        .WithRequestedSendTime(requestedSendTime)
        .WithSendersReference(orderSendersReference)
        .WithRecipient(recipient)
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
