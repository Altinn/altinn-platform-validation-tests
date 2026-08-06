import { check, fail } from "k6";

import { OrdersApiClient } from "../../../../../clients/core/notifications/index.js";

/**
 * @param {OrdersApiClient} ordersApiClient TODO: description
 * @param { { subject: string, body: string, contentType: string, fromAddress: string } } emailTemplate TODO: description
 * @param {string } sendersReference TODO: description
 * @param {Array<{ emailAddress: string, mobileNumber: string, organizationNumber: string, nationalIdentityNumber: string, isReserved: boolean, }> } recipients TODO: description
 * @returns (string | ArrayBuffer | null)
 */
export function PostEmailNotificationOrder(ordersApiClient, emailTemplate, sendersReference, recipients) {
    const res = ordersApiClient.PostEmailNotificationOrder(emailTemplate, sendersReference, recipients);

    const success = check(res, {
        "POST email notification order request. Status is 202 Accepted": (r) => r.status === 202,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
        fail("POST email notification order request failed");
    }

    const selfLink = res.headers["Location"];
    check(res, {
        "POST email notification order request. Location header provided": (r) => selfLink,
    });

    return res.body;
}
