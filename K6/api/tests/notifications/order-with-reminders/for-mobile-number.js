import {
    NotificationOrderChainRequestExtBuilder,
    NotificationRecipientExtBuilder,
    RecipientSmsExtBuilder,
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
        ]
    );
    return;
}

function generateDomainObjects() {
    const uniqueIdentifier = uuidv4().substring(0, 8);
    const requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    const orderSendersReference = `k6-order-${uniqueIdentifier}`;
    const reminderSendersReference = `k6-reminder-${uniqueIdentifier}`;
    const phoneNumber = "+4799999999";

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientSms(
            new RecipientSmsExtBuilder()
                .WithPhoneNumber(phoneNumber)
                .WithSmsSettings(
                    new SmsSendingOptionsExtBuilder()
                        .WithSendingTimePolicy("Daytime")
                        .WithBody("Dear user, please check your inbox for an important update. - Altinn Team")
                        .Build()
                )
                .Build()
        )
        .Build();

    /** @type {NotificationReminderExt[]} */
    const reminders = [
        {
            delayDays: 1,
            sendersReference: reminderSendersReference,
            recipient: new NotificationRecipientExtBuilder()
                .WithRecipientSms(
                    new RecipientSmsExtBuilder()
                        .WithPhoneNumber(phoneNumber)
                        .WithSmsSettings(
                            new SmsSendingOptionsExtBuilder()
                                .WithSendingTimePolicy("Daytime")
                                .WithBody("Reminder: please check your inbox for an important update. - Altinn Team")
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
