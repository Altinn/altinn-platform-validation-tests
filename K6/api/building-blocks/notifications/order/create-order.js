
import { check } from "k6";

import { OrderClient } from "../../../../clients/order/index.js";

/**
 * Creates a new notification order with zero or more reminders.
 *
 * @param {OrderClient} orderClient Client for the Order API.
 * @param {NotificationOrderChainRequestExt} request Notification order request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationOrderChainResponseExt|null} Created notification order response.
 */
export function OrderCreateOrder(
    orderClient,
    request,
    labels = null,
) {
    const res = orderClient.OrderCreateOrder(request, labels);

    /** @type {NotificationOrderChainResponseExt|null} */
    let notificationOrder = null;

    const succeed = check(res, {
        "OrderCreateOrder - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
        "OrderCreateOrder - status text is successful": (r) =>
            r.status_text === "200 OK" ||
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationOrder;
    }

    check(res, {
        "OrderCreateOrder - body is valid": (r) => {
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
