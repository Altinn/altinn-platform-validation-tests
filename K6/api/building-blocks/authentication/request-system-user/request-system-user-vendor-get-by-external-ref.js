import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/authentication/index.js";
import { RequestSystemResponse } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a system user request by external reference.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} systemId System identifier.
 * @param {string} orgNo Organization number.
 * @param {string} externalRef External reference.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestSystemResponse|null} Request response.
 */
export function RequestSystemUserVendorGetByExternalRef(
    requestSystemUserClient,
    systemId,
    orgNo,
    externalRef,
    labels = null,
) {
    const res = withRetries(
        () =>
            requestSystemUserClient.RequestSystemUserVendorGetByExternalRef(
                systemId,
                orgNo,
                externalRef,
                labels,
            ),
        "RequestSystemUserVendorGetByExternalRef",
    );

    /** @type {RequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "RequestSystemUserVendorGetByExternalRef - status code is 200": (r) =>
            r.status === 200,
        "RequestSystemUserVendorGetByExternalRef - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "RequestSystemUserVendorGetByExternalRef - body is valid": (r) => {
            try {
                requestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponse;
}
