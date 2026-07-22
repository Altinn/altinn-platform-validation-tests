
import { check } from "k6";

import { StatusClient } from "../../../../clients/status/index.js";

/**
 * Retrieves the delivery manifest for a specific notification order.
 *
 * @param {StatusClient} statusClient Client for the Status API.
 * @param {string} id Notification order identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationDeliveryManifestExt|null} Delivery manifest.
 */
export function StatusGetShipment(
    statusClient,
    id,
    labels = null,
) {
    const res = statusClient.StatusGetShipment(id, labels);

    /** @type {NotificationDeliveryManifestExt|null} */
    let deliveryManifest = null;

    const succeed = check(res, {
        "StatusGetShipment - status code is 200": (r) =>
            r.status === 200,
        "StatusGetShipment - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
