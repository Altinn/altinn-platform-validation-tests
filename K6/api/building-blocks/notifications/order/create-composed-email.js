import { check } from "k6";

import { OrderClient } from "../../../../clients/order/index.js";

/**
 * Creates a new composed email notification order.
 *
 * @param {OrderClient} orderClient Client for the Order API.
 * @param {ComposedEmailRequestExt} request Composed email order request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationOrderChainResponseExt|null} Created notification order response.
 */
export function OrderCreateComposedEmail(
    orderClient,
    request,
    labels = null,
) {
    const res = orderClient.OrderCreateComposedEmail(request, labels);

    /** @type {NotificationOrderChainResponseExt|null} */
    let notificationOrder = null;

    const succeed = check(res, {
        "OrderCreateComposedEmail - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
        "OrderCreateComposedEmail - status text is successful": (r) =>
            r.status_text === "200 OK" ||
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationOrder;
    }

    check(res, {
        "OrderCreateComposedEmail - body is valid": (r) => {
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
