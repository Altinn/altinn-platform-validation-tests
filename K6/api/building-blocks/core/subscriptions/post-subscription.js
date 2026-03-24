import { check } from "k6";
import { SubscriptionsApiClient } from "../../../../clients/core/subscriptions/index.js"

/**
 * @param {SubscriptionsApiClient} subscriptionsApiClient
 * @param {string } endPoint
 * @param {string } resourceFilter
 * @returns (string | ArrayBuffer | null)
 */
export function PostSubscription(
    subscriptionsApiClient,
    endPoint,
    resourceFilter,
) {
    const response = subscriptionsApiClient.PostSubscription(
        endPoint,
        resourceFilter
    );

    const success = check(response, {
        "Subscription created. Status is 201": (r) => r.status === 201,
    });

    if (!success) {
        throw new Error(`[SETUP] Failed to create subscription: HTTP ${response.status} – ${response.body}`);
    }

    let parsedBody;
    try {
        parsedBody = JSON.parse(response.body);
    } catch {
        throw new Error(`[SETUP] Subscription created with HTTP 201, but body was not valid JSON: ${response.body}`);
    }
    const subscriptionId = parsedBody?.id;
    if (!subscriptionId) {
        throw new Error(`[SETUP] Subscription response missing 'id': ${response.body}`);
    }

    return subscriptionId;
}
