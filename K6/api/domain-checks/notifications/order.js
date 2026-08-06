import { check } from "k6";

/**
 * Verifies that the order response carries a shipment ID.
 *
 * @param {NotificationOrderChainResponseExt} notificationOrderChainResponseExt Response to check.
 * @returns {boolean} True when the check passed.
 */
function CheckResponseContainsShipmentID(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsShipmentID - Response contains shipment ID": (response) =>
            typeof response?.notification?.shipmentId === "string" && response.notification.shipmentId.length > 0,
    });

    if (!success) {
        console.error(`CheckResponseContainsShipmentID - Response does not contain shipment ID: ${JSON.stringify(notificationOrderChainResponseExt)}`);
    }
    return success;
}

/**
 * Verifies that the order response carries a notification order ID.
 *
 * @param {NotificationOrderChainResponseExt} notificationOrderChainResponseExt Response to check.
 * @returns {boolean} True when the check passed.
 */
function CheckResponseContainsNotificationOrderID(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsNotificationOrderID - Response contains notification order ID": (response) =>
            typeof response?.notificationOrderId === "string" && response.notificationOrderId.length > 0,
    });

    if (!success) {
        console.error(`CheckResponseContainsNotificationOrderID - Response does not contain notification order ID: ${JSON.stringify(notificationOrderChainResponseExt)}`);
    }
    return success;
}

/**
 * Verifies that the order response includes a reminders array.
 *
 * @param {NotificationOrderChainResponseExt} notificationOrderChainResponseExt Response to check.
 * @returns {boolean} True when the check passed.
 */
function CheckResponseContainsReminders(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseContainsReminders - Response includes reminders": (response) =>
            Array.isArray(response?.notification?.reminders),
    });

    if (!success) {
        console.error(`CheckResponseContainsReminders - Response does not include reminders: ${JSON.stringify(notificationOrderChainResponseExt)}`);
    }
    return success;
}

/**
 * Verifies that every reminder in the response carries a shipment ID.
 *
 * @param {NotificationOrderChainResponseExt} notificationOrderChainResponseExt Response to check.
 * @returns {boolean} True when the check passed.
 */
function CheckResponseRemindersAllContainShipmentIDs(notificationOrderChainResponseExt) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseRemindersAllContainShipmentIDs - All reminders have shipment IDs": (response) =>
            Array.isArray(response?.notification?.reminders)
            && response.notification.reminders.every(e => typeof e.shipmentId === "string" && e.shipmentId.length > 0),
    });

    if (!success) {
        console.error(`CheckResponseRemindersAllContainShipmentIDs - Not all reminders have shipment IDs: ${JSON.stringify(notificationOrderChainResponseExt)}`);
    }
    return success;
}

/**
 * Verifies that the number of reminders in the response matches the request.
 *
 * @param {NotificationOrderChainResponseExt} notificationOrderChainResponseExt Response to check.
 * @param {number} expected Number of reminders sent in the request.
 * @returns {boolean} True when the check passed.
 */
function CheckResponseRemindersCountMatchesRequests(notificationOrderChainResponseExt, expected) {
    const success = check(notificationOrderChainResponseExt, {
        "CheckResponseRemindersCountMatchesRequests - Reminder count matches request": (response) =>
            response?.notification?.reminders?.length === expected,
    });

    if (!success) {
        console.error(`CheckResponseRemindersCountMatchesRequests - Reminder count does not match request, expected ${expected}: ${JSON.stringify(notificationOrderChainResponseExt)}`);
    }
    return success;
}

export const OrderDomainChecks = {
    CheckResponseContainsNotificationOrderID,
    CheckResponseContainsReminders,
    CheckResponseContainsShipmentID,
    CheckResponseRemindersAllContainShipmentIDs,
    CheckResponseRemindersCountMatchesRequests
};
