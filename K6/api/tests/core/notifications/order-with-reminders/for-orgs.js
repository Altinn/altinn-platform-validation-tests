
import { NotificationOrderChainRequestExtBuilder, NotificationRecipientExtBuilder } from "../../../../../clients/notifications/order/orders.builders.js";
import { RecipientOrganizationExt } from "../../../../../clients/notifications/types.js";
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
            "orgNoRecipient",
            "resourceId",
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

    /** @type {DialogportenIdentifiersExt|null} */
    const dialogportenAssociation = {
        dialogId: uniqueIdentifier,
        transmissionId: uniqueIdentifier
    };

    /** @type {NotificationReminderExt|null} */
    let reminders = [{
        "sendersReference": reminderSendersReference,
        "delayDays": 1,
        "recipient": {
            "recipientEmail": {
                "emailSettings": {
                    "subject": "Important update",
                    "body": "Dear user, please check your inbox for an important update. - Altinn Team"
                }
            }
        }
    }];

    /** @type {RecipientOrganizationExt|null} */
    const recipientOrganization = {
        resourceId: __ENV.resourceId,
        orgNumber: __ENV.orgNoRecipient
    };

    const recipient = new NotificationRecipientExtBuilder()
        .WithRecipientOrganization(recipientOrganization)
        .Build();

    /** @type {NotificationOrderChainRequestExt|null} */
    const request = new NotificationOrderChainRequestExtBuilder()
        .WithIdempotencyId(uuidv4())
        .WithRequestedSendTime(requestedSendTime)
        .WithSendersReference(orderSendersReference)
        .WithRecipient(recipient)
        .WithDialogportenAssociation(dialogportenAssociation)
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
