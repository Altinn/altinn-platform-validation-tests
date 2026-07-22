import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/subscription/index.js";


/**
 * Retrieves all subscriptions for the authorized consumer.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SubscriptionList|null} Subscription list.
 */
export function SubscriptionGetAll(
    subscriptionClient,
    labels = null,
) {
    const res = subscriptionClient.SubscriptionGetAll(labels);

    /** @type {SubscriptionList|null} */
    let subscriptions = null;

    const succeed = check(res, {
        "SubscriptionGetAll - status code is 200": (r) =>
            r.status === 200,
        "SubscriptionGetAll - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subscriptions;
    }

    check(res, {
        "SubscriptionGetAll - body is valid": (r) => {
            try {
                subscriptions = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return subscriptions;
}
