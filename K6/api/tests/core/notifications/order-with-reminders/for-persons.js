
import { NotificationOrderChainRequestExtBuilder, NotificationRecipientExtBuilder } from "../../../../../clients/notifications/order/orders.builders.js";
import { DialogportenIdentifiersExt, NotificationReminderExt } from "../../../../../clients/notifications/types.js";
import { uuidv4 } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { OrderCreateOrder } from "../../../../building-blocks/notifications/order/create-order.js";
import { OrderDomainChecks } from "../../../../domain-checks/notifications/order.js";
import { getClients } from "./common.js";

export function setup() {
    requireEnv(
        [
            "ENVIRONMENT",
            "BASE_URL",
            "ninRecipient",
            "tokenGeneratorUserName",
            "tokenGeneratorUserPwd"
        ]
    );
    return;
}

export default function () {
    const [ordersApiClient] = getClients();

    const uniqueIdentifier = uuidv4().substring(0, 8);
    const requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    const orderSendersReference = `k6-order-${uniqueIdentifier}`;
    const reminderSendersReference = `k6-reminder-${uniqueIdentifier}`;

    /** @type {NotificationReminderExt|null} */
    const reminders = [
        {
            "delayDays": 15,
            "sendersReference": reminderSendersReference,
            "recipient": {
                "recipientPerson": {
                    "ignoreReservation": true,
                    "channelSchema": "SmsPreferred",
                    "nationalIdentityNumber": __ENV.ninRecipient,
                    "smsSettings": {
                        "sendingTimePolicy": "Daytime",
                        "body": "Dear $recipientName$, please check your email for an important update regarding your account $recipientNumber$. - Altinn Team"
                    },
                    "emailSettings": {
                        "contentType": "Html",
                        "sendingTimePolicy": "Anytime",
                        "subject": "Important Update Regarding Your Account",
                        "body": "Dear $recipientName$,\n\nWe wanted to inform you about an important update to your account $recipientNumber$. Please log in to your dashboard to review the changes.\n\nBest regards,\nAltinn Team"
                    }
                }
            }
        }
    ];

    /** @type {DialogportenIdentifiersExt|null} */
    const dialogportenAssociation = {
        dialogId: uniqueIdentifier,
        transmissionId: uniqueIdentifier
    };

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientExternalIdentity(__ENV.ninRecipient)
        .Build();

    /** @type {NotificationOrderChainRequestExt|null} */
    const request = new NotificationOrderChainRequestExtBuilder()
        .WithIdempotencyId(uuidv4())
        .WithDialogportenAssociation(dialogportenAssociation)
        .WithRequestedSendTime(requestedSendTime)
        .WithSendersReference(orderSendersReference)
        .WithRecipient(recipient)
        .WithReminders()
        .Build();

    let response = OrderCreateOrder(
        ordersApiClient,
        request
    );

    OrderDomainChecks.CheckResponseContainsShipmentID(response);
    OrderDomainChecks.CheckResponseContainsNotificationOrderID(response);
    OrderDomainChecks.CheckResponseContainsReminders(response);
    OrderDomainChecks.CheckResponseRemindersCountMatchesRequests(response, reminders.length);
    OrderDomainChecks.CheckResponseRemindersAllContainShipmentIDs(response);

}
