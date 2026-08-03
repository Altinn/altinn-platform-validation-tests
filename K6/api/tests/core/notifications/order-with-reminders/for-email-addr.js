import { check } from "k6";

import { OrderClient } from "../../../../../clients/notifications/order/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, uuidv4 } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { OrderCreateOrder } from "../../../../building-blocks/notifications/order/index.js";

const testData = JSON.parse(open("../../../../../testdata/core/orders/order-with-reminders-for-email-address.json"));

let tokenGenerator = null;
let ordersApiClient = null;

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "tokenGeneratorUserName", "tokenGeneratorUserPwd"]);
    return;
}

function getClients() {
    if (tokenGenerator == null || ordersApiClient == null) {
        const scopes = CreateScopeString([
            AltinnScopes.SERVICEOWNER.NOTIFICATIONS.CREATE
        ]);
        const options = new EnterpriseTokenBuilder()
            .withScopes(scopes)
            .withOrganization("ttd")
            .withOrganizationNumber("991825827")
            .build();

        tokenGenerator
            = new EnterpriseTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd);
        ordersApiClient
            = new OrdersV2ApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [ordersApiClient];
}

export default function () {

    let [ordersApiClient] = getClients();

    testData.requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    testData.sendersReference = `k6-order-${uuidv4().substring(0, 8)}`;
    testData.recipient.recipientEmail.emailAddress = "noreply@altinn.no";

    testData.reminders = testData.reminders.map(reminder => {
        const updatedReminder = { ...reminder, sendersReference: `k6-reminder-${uuidv4().substring(0, 8)}` };

        updatedReminder.recipient.recipientEmail.emailAddress = "noreply@altinn.no";

        return updatedReminder;
    });

    testData.idempotencyId = uuidv4();

    let response = PostNotificationOrderV2(
        ordersApiClient,
        testData.idempotencyId,
        testData.sendersReference,
        null,
        testData.requestedSendTime,
        testData.recipient,
        testData.reminders
    );

    const expectedReminderCount = testData.reminders.length;
    response = JSON.parse(response);
    const success = check(response, {
        "Response contains shipment ID": () => typeof response.notification.shipmentId === "string" && response.notification.shipmentId.length > 0,
        "Response contains notification order ID": () => typeof response.notificationOrderId === "string" && response.notificationOrderId.length > 0,
        "Response includes reminders": () => Array.isArray(response.notification.reminders),
        "Reminder count matches request": () => response.notification.reminders.length === expectedReminderCount,
        "All reminders have shipment IDs": () => response.notification.reminders.length === 0 || response.notification.reminders.every(e => typeof e.shipmentId === "string" && e.shipmentId.length > 0)
    });

}
