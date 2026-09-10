
import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/events/subscription/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {number} id Subscription id.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether deletion succeeded.
 */
export function SubscriptionDelete(
    subscriptionClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => subscriptionClient.SubscriptionDelete(
            id,
            labels,
        ),
        "SubscriptionDelete",
    );

    return check(res, {
        "SubscriptionDelete - status code is 200": (r) =>
            r.status === 200,
    });
}
