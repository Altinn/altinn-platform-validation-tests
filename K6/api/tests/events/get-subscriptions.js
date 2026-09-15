import { group } from "k6";

import { SubscriptionGetAll } from "../../building-blocks/events/subscription/index.js";
import { getSmokeOptions } from "../common/smoke.js";
import { getEventsSmokeConfiguration, getSubscriptionClient } from "./commons.js";

const listLabel = { step: "List subscriptions" };

export const options = getSmokeOptions([listLabel]);

export function setup() {
    return getEventsSmokeConfiguration();
}

/**
 * Smoke test: the Subscription client builds a request Events accepts.
 *
 * Lists the service owner's subscriptions. An org without subscriptions
 * answers an empty list, which is fine; the point is that the call is
 * accepted.
 */
export default function () {
    const subscriptionClient = getSubscriptionClient();

    group("List the org's subscriptions", function () {
        SubscriptionGetAll(subscriptionClient, listLabel);
    });
}
