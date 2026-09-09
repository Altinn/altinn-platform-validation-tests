import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/events/subscription/index.js";
import { Subscription, SubscriptionRequestModel } from "../../../../clients/events/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a new subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {SubscriptionRequestModel} request Subscription payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Subscription|null} Created subscription.
 */
export function SubscriptionCreate(
    subscriptionClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => subscriptionClient.SubscriptionCreate(
            request,
            labels,
        ),
        "SubscriptionCreate",
    );

    /** @type {Subscription|null} */
    let subscription = null;

    const succeed = check(res, {
        "SubscriptionCreate - status code is 201": (r) =>
            r.status === 201,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subscription;
    }

    check(res, {
        "SubscriptionCreate - body is valid": (r) => {
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
