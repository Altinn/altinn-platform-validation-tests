import { check } from "k6";

import { InstantOrdersClient } from "../../../../clients/instant-orders/index.js";

/**
 * Creates and sends an instant email notification.
 *
 * @param {InstantOrdersClient} instantOrdersClient Client for the Instant Orders API.
 * @param {InstantEmailNotificationOrderRequestExt} request Email notification payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {InstantNotificationOrderResponseExt|null} Notification order response.
 */
export function InstantOrdersCreateEmail(
    instantOrdersClient,
    request,
    labels = null,
) {
    const res = instantOrdersClient.InstantOrdersCreateEmail(
        request,
        labels,
    );

    /** @type {InstantNotificationOrderResponseExt|null} */
    let notificationOrder = null;

    const succeed = check(res, {
        "InstantOrdersCreateEmail - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
        "InstantOrdersCreateEmail - status text is 200 OK or 201 Created": (r) =>
            r.status_text === "200 OK" ||
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationOrder;
    }

    check(res, {
        "InstantOrdersCreateEmail - body is valid": (r) => {
            try {
                notificationOrder = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return notificationOrder;
}
