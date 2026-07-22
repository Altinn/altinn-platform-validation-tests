import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../clients/change-request-system-user/index.js";

/**
 * Retrieves a change request by external reference.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {string} systemId System identifier.
 * @param {string} orgNo Organisation number.
 * @param {string} externalRef External reference.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponse|null} Change request response.
 */
export function ChangeRequestSystemUserVendorGetByExternalRef(
    changeRequestSystemUserClient,
    systemId,
    orgNo,
    externalRef,
    labels = null,
) {
    const res =
        changeRequestSystemUserClient.ChangeRequestSystemUserVendorGetByExternalRef(
            systemId,
            orgNo,
            externalRef,
            labels,
        );

    /** @type {ChangeRequestResponse|null} */
    let changeRequestResponse = null;

    const succeed = check(res, {
        "ChangeRequestSystemUserVendorGetByExternalRef - status code is 200": (
            r,
        ) => r.status === 200,
        "ChangeRequestSystemUserVendorGetByExternalRef - status text is 200 OK":
            (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeRequestResponse;
    }

    check(res, {
        "ChangeRequestSystemUserVendorGetByExternalRef - body is valid": (r) => {
            try {
                changeRequestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changeRequestResponse;
}
