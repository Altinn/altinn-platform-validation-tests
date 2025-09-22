import { check } from "k6"
import { EnterpriseTokenGenerator, uuidv4 } from '../../../../commonImports.js';
import { OrdersV2ApiClient } from "../../../../clients/core/notifications/index.js"
import { PostNotificationOrderV2 } from '../../../building_blocks/core/notifications/orders/index.js';

const testData = JSON.parse(open("../../../../testdata/core/orders/order-with-reminders-for-mobile-number.json"));

export default function () {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);
    options.set("scopes", "altinn:serviceowner/notifications.create");
    options.set("org", "ttd");
    options.set("orgNo", "991825827");

    const tokenGenerator
        = new EnterpriseTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd)

    const ordersApiClient
        = new OrdersV2ApiClient(__ENV.BASE_URL, tokenGenerator)

    testData.requestedSendTime = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(); // 120 days into the future
    testData.sendersReference = `k6-order-${uuidv4().substring(0, 8)}`;
    testData.recipient.recipientSms.phoneNumber = "+4799999999";

    testData.reminders = testData.reminders.map(reminder => {
        const updatedReminder = { ...reminder, sendersReference: `k6-reminder-${uuidv4().substring(0, 8)}` };

        updatedReminder.recipient.recipientSms.phoneNumber = "+4799999999";

        return updatedReminder;
    });

    testData.idempotencyId = uuidv4()

    let response = PostNotificationOrderV2(
        ordersApiClient,
        testData.idempotencyId,
        testData.sendersReference,
        testData.requestedSendTime,
        testData.recipient,
        testData.reminders
    )

    const expectedReminderCount = testData.reminders.length;
    response = JSON.parse(response);
    const success = check(response, {
        "Response contains shipment ID": () => typeof response.notification.shipmentId === 'string' && response.notification.shipmentId.length > 0,
        "Response contains notification order ID": () => typeof response.notificationOrderId === 'string' && response.notificationOrderId.length > 0,
        "Response includes reminders": () => Array.isArray(response.notification.reminders),
        "Reminder count matches request": () => response.notification.reminders.length === expectedReminderCount,
        "All reminders have shipment IDs": () => response.notification.reminders.length === 0 || response.notification.reminders.every(e => typeof e.shipmentId === 'string' && e.shipmentId.length > 0)
    });


}
