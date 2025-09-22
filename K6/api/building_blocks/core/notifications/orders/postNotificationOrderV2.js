import { check } from 'k6';
import { OrdersV2ApiClient } from "../../../../../clients/core/notifications/index.js"

/**
 * @param {OrdersV2ApiClient} ordersApiClient
 * @param {string } idempotencyId
 * @param {string } sendersReference
 * @param {string } requestedSendTime
 * @param {Object } recipient
 * @param {Array<Object> } reminders
 * @returns (string | ArrayBuffer | null)
 */
export function PostNotificationOrderV2(
    ordersApiClient,
    idempotencyId,
    sendersReference,
    requestedSendTime,
    recipient,
    reminders
) {
    const res = ordersApiClient.PostNotificationOrderV2(
        idempotencyId,
        sendersReference,
        requestedSendTime,
        recipient,
        reminders
    )

    const success = check(res, {
        "PostNotificationOrderV2 - status code MUST be 201": (res) => res.status == 201,
    })

    if (!success) {
        console.log(res.status)
        console.log(res.body)
    }

    return res.body
}
