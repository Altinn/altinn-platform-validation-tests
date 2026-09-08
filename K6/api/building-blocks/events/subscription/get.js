
import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/events/subscription/index.js";
import { Subscription } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a specific subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {number} id Subscription id.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Subscription|null} Subscription.
 */
export function SubscriptionGet(
    subscriptionClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => subscriptionClient.SubscriptionGet(
            id,
            labels,
        ),
        "SubscriptionGet",
    );

    /** @type {Subscription|null} */
    let subscription = null;

    const succeed = check(res, {
        "SubscriptionGet - status code is 200": (r) =>
            r.status === 200,
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
