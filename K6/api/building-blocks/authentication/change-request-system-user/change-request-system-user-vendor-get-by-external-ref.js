import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../clients/authentication/index.js";
import { ChangeRequestResponse } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a change request by external reference.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {string} systemId System identifier.
 * @param {string} orgNo Organisation number.
 * @param {string} externalRef External reference.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ChangeRequestResponse|null} Change request response.
 */
export function ChangeRequestSystemUserVendorGetByExternalRef(
    changeRequestSystemUserClient,
    systemId,
    orgNo,
    externalRef,
    labels = null,
) {
    const res = withRetries(
        () =>
            changeRequestSystemUserClient.ChangeRequestSystemUserVendorGetByExternalRef(
                systemId,
                orgNo,
                externalRef,
                labels,
            ),
        "ChangeRequestSystemUserVendorGetByExternalRef",
    );

    /** @type {ChangeRequestResponse|null} */
    let changeRequestResponse = null;

    const succeed = check(res, {
        "ChangeRequestSystemUserVendorGetByExternalRef - status code is 200": (
            r,
        ) => r.status === 200,
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
