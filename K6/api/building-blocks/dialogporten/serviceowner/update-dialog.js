import { check } from "k6";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param { string } dialogId
 * @param { object } body
 * @returns (string | ArrayBuffer | null)
 */
export function UpdateDialog(
    serviceOwnerApiClient,
    dialogId,
    body,
    label = null
) {
    const res = serviceOwnerApiClient.UpdateDialog(
        dialogId,
        body,
        label
    );

    const success = check(res, {
        "UpdateDialog - status code MUST be 204": (res) => res.status == 204,
        "UpdateDialog - body is empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body == null;
        }
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res.body;
}
