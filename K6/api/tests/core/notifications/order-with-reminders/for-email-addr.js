
import { NotificationOrderChainRequestExtBuilder, NotificationRecipientExtBuilder } from "../../../../../clients/notifications/order/index.js";
import { NotificationReminderExt } from "../../../../../clients/notifications/types.js";
import { uuidv4 } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { OrderCreateOrder } from "../../../../building-blocks/notifications/order/index.js";
import { OrderDomainChecks } from "../../../../domain-checks/notifications/order.js";
import { getClients } from "./common.js";

export function setup() {
    requireEnv(
        [
            "ENVIRONMENT",
            "BASE_URL",
            "tokenGeneratorUserName",
            "tokenGeneratorUserPwd"
        ]
    );
    return;
}

export default function () {

    let [ordersApiClient] = getClients();

    const uniqueIdentifier = uuidv4().substring(0, 8);
    const requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    const orderSendersReference = `k6-order-${uniqueIdentifier}`;
    const reminderSendersReference = `k6-reminder-${uniqueIdentifier}`;
    const recipientEmail = "noreply@altinn.no";

    /** @type {NotificationReminderExt|null} */
    let reminders = [{
        "delayDays": 1,
        "recipient": {
            "recipientEmail": {
                "emailSettings": {
                    "subject": "Important update",
                    "body": "Dear user, please check your inbox for an important update. - Altinn Team",
                    "emailAddress": recipientEmail
                }
            }
        }
    }];

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientEmail(recipientEmail)
        .Build();

    /** @type {NotificationOrderChainRequestExt|null} */
    const request = new NotificationOrderChainRequestExtBuilder()
        .WithIdempotencyId(uuidv4())
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
