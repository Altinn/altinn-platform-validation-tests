import { check } from "k6";

/**
 *
 * @param {NotificationOrderChainResponseExt } notificationOrderChainResponseExt
 * @returns {boolean}
 */
function CheckResponseContainsShipmentID(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsShipmentID - Response contains shipment ID": (response) =>
            typeof response.notification.shipmentId === "string" && response.notification.shipmentId.length > 0,
    });

    if (!success) {
        console.error(`CheckResponseContainsShipmentID - Response does not contain shipment ID: ${JSON.stringify(notificationOrderChainResponseExt.notification.shipmentId)}`);
    }
    return success;
}

/**
 *
 * @param {NotificationOrderChainResponseExt } notificationOrderChainResponseExt
 * @returns {boolean}
 */
function CheckResponseContainsNotificationOrderID(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsNotificationOrderID - Response contains notification order ID": (response) =>
            typeof response.notificationOrderId === "string" && response.notificationOrderId.length > 0,
    });

    if (!success) {
        console.error(`CheckResponseContainsNotificationOrderID - Response does not contain notification order ID: ${JSON.stringify(notificationOrderChainResponseExt.notification.shipmentId)}`);
    }
    return success;
}

/**
 *
 * @param {NotificationOrderChainResponseExt } notificationOrderChainResponseExt
 * @returns {boolean}
 */
function CheckResponseContainsReminders(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsReminders - Response includes reminders": (response) =>
            Array.isArray(response.notification.reminders),
    });

    if (!success) {
        console.error(`CheckResponseContainsReminders - Response does not include reminders: ${JSON.stringify(notificationOrderChainResponseExt.notification.shipmentId)}`);
    }
    return success;
}

/**
 *
 * @param {NotificationOrderChainResponseExt } notificationOrderChainResponseExt
 * @returns {boolean}
 */
function CheckResponseRemindersAllContainShipmentIDs(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseRemindersAllContainShipmentIDs - All reminders have shipment IDs": (response) =>
            response.notification.reminders.length === 0 || response.notification.reminders.every(e => typeof e.shipmentId === "string" && e.shipmentId.length > 0)
    });

    if (!success) {
        console.error(`CheckResponseRemindersAllContainShipmentIDs - Not All reminders have shipment IDs: ${JSON.stringify(notificationOrderChainResponseExt.notification.shipmentId)}`);
    }
    return success;
}

/**
 *
 * @param {NotificationOrderChainResponseExt } notificationOrderChainResponseExt
 * @param {number} expected
 * @returns {boolean}
 */
function CheckResponseRemindersCountMatchesRequests(notificationOrderChainResponseExt, expected) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseRemindersCountMatchesRequests - Reminder count matches request": (response) =>
            response.notification.reminders.length === expected,
    });

    if (!success) {
        console.error(`CheckResponseRemindersCountMatchesRequests - Reminder count does not matche request: ${JSON.stringify(notificationOrderChainResponseExt.notification.shipmentId)}`);
    }
    return success;
}

export const OrderDomainChecks = {
    CheckResponseContainsNotificationOrderID,
    CheckResponseContainsReminders,
    CheckResponseRemindersAllContainShipmentIDs,
    CheckResponseRemindersCountMatchesRequests,
    CheckResponseRemindersCountMatchesRequests
};
