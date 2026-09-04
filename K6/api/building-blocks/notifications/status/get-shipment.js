
import { check } from "k6";

import { StatusClient } from "../../../../clients/notifications/status/index.js";
import { NotificationDeliveryManifestExt } from "../../../../clients/notifications/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves the delivery manifest for a specific notification order.
 *
 * @param {StatusClient} statusClient Client for the Status API.
 * @param {string} id Notification order identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {NotificationDeliveryManifestExt|null} Delivery manifest.
 */
export function StatusGetShipment(
    statusClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => statusClient.StatusGetShipment(id, labels),
        "StatusGetShipment",
    );

    /** @type {NotificationDeliveryManifestExt|null} */
    let deliveryManifest = null;

    const succeed = check(res, {
        "StatusGetShipment - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deliveryManifest;
    }

    check(res, {
        "StatusGetShipment - body is valid": (r) => {
            try {
                deliveryManifest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return deliveryManifest;
}
