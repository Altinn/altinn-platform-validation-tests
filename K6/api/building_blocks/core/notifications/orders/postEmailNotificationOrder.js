import { check } from 'k6';
import { OrdersApiClient } from "../../../../../clients/core/notifications/index.js"

/**
 * @param {OrdersApiClient} ordersApiClient
 * @param {string } subject
 * @param {string } emailBody
 * @param {string } contentType
 * @param {string } fromAddress
 * @returns (string | ArrayBuffer | null)
 */
export function PostEmailNotificationOrder(ordersApiClient, subject, emailBody, contentType, fromAddress) {
    const res = ordersApiClient.PostEmailNotificationOrder(subject, emailBody, contentType, fromAddress)

    const success = check(res, {
        "POST email notification order request. Status is 202 Accepted": (r) => r.status === 202,
    });

    if (!success) {
        console.log(res.status)
        console.log(res.body)
        fail("POST email notification order request failed");
    }

    const selfLink = res.headers["Location"];
    check(res, {
        "POST email notification order request. Location header provided": (r) => selfLink,
    });

    return res.body
}
