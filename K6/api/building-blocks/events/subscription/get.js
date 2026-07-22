
import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/subscription/index.js";

/**
 * Retrieves a specific subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {number} id Subscription id.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Subscription|null} Subscription.
 */
export function SubscriptionGet(
    subscriptionClient,
    id,
    labels = null,
) {
    const res = subscriptionClient.SubscriptionGet(
        id,
        labels,
    );

    /** @type {Subscription|null} */
    let subscription = null;

    const succeed = check(res, {
        "SubscriptionGet - status code is 200": (r) =>
            r.status === 200,
        "SubscriptionGet - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subscription;
    }

    check(res, {
        "SubscriptionGet - body is valid": (r) => {
            try {
                subscription = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return subscription;
}
