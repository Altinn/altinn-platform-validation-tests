import { check } from "k6";

import { InstantOrdersClient } from "../../../../clients/notifications/instant-orders/index.js";
import { InstantNotificationOrderResponseExt, InstantSmsNotificationOrderRequestExt } from "../../../../clients/notifications/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates and sends an instant SMS notification.
 *
 * @param {InstantOrdersClient} instantOrdersClient Client for the Instant Orders API.
 * @param {InstantSmsNotificationOrderRequestExt} request SMS notification payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {InstantNotificationOrderResponseExt|null} Notification order response.
 */
export function InstantOrdersCreateSms(
    instantOrdersClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instantOrdersClient.InstantOrdersCreateSms(
            request,
            labels,
        ),
        "InstantOrdersCreateSms",
    );

    /** @type {InstantNotificationOrderResponseExt|null} */
    let notificationOrder = null;

    const succeed = check(res, {
        "InstantOrdersCreateSms - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationOrder;
    }

    check(res, {
        "InstantOrdersCreateSms - body is valid": (r) => {
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
