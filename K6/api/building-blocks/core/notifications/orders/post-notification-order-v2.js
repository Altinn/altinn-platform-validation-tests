import { check } from "k6";

import { OrdersV2ApiClient } from "../../../../../clients/core/notifications/index.js";

/**
 * @param {OrdersV2ApiClient} ordersApiClient TODO: description
 * @param {string } idempotencyId TODO: description
 * @param {string } sendersReference TODO: description
 * @param { {dialogId: string, transmissionId: string} } dialogportenAssociation TODO: description
 * @param {string } requestedSendTime TODO: description
 * @param {object} recipient TODO: description
 * @param {Array<object>} reminders TODO: description
 * @returns (string | ArrayBuffer | null)
 */
export function PostNotificationOrderV2(
    ordersApiClient,
    idempotencyId,
    sendersReference,
    dialogportenAssociation,
    requestedSendTime,
    recipient,
    reminders
) {
    const res = ordersApiClient.PostNotificationOrderV2(
        idempotencyId,
        sendersReference,
        dialogportenAssociation,
        requestedSendTime,
        recipient,
        reminders
    );

    const success = check(res, {
        "PostNotificationOrderV2 - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
