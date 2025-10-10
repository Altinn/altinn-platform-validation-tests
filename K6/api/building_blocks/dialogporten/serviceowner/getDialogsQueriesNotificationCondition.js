import { check } from 'k6';
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js"

/**
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param { string } dialogId
 * @param { string } conditionType
 * @param { string } activityType
 * @param { string } transmissionId
 * @returns (string | ArrayBuffer | null)
 */
export function GetDialogsQueriesNotificationCondition(
    serviceOwnerApiClient,
    dialogId,
    conditionType,
    activityType,
    transmissionId,
    label = null
) {
    const res = serviceOwnerApiClient.GetDialogsQueriesNotificationCondition(
        dialogId,
        conditionType,
        activityType,
        transmissionId,
        label
    )

    const success = check(res, {
        "GetDialogsQueriesNotificationCondition - status code MUST be 200": (res) => res.status == 200,
        'GetDialogsQueriesNotificationCondition - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    })

    if (!success) {
        console.log(res.status)
        console.log(res.body)
    }

    return res.body
}
