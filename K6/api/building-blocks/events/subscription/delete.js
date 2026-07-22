
import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/subscription/index.js";
/**
 * Deletes a subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {number} id Subscription id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether deletion succeeded.
 */
export function SubscriptionDelete(
    subscriptionClient,
    id,
    labels = null,
) {
    const res = subscriptionClient.SubscriptionDelete(
        id,
        labels,
    );

    return check(res, {
        "SubscriptionDelete - status code is 200": (r) =>
            r.status === 200,
        "SubscriptionDelete - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
