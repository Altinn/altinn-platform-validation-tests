import { check } from "k6";

import { SubscriptionClient } from "../../../../clients/subscription/index.js";

/**
 * Creates a new subscription.
 *
 * @param {SubscriptionClient} subscriptionClient Client for the Subscription API.
 * @param {SubscriptionRequestModel} request Subscription payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Subscription|null} Created subscription.
 */
export function SubscriptionCreate(
    subscriptionClient,
    request,
    labels = null,
) {
    const res = subscriptionClient.SubscriptionCreate(
        request,
        labels,
    );

    /** @type {Subscription|null} */
    let subscription = null;

    const succeed = check(res, {
        "SubscriptionCreate - status code is 201": (r) =>
            r.status === 201,
        "SubscriptionCreate - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
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
