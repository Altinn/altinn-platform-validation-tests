import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/service-owner/request/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets supported party URN types.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<string>|null} Supported party URN types.
 */
export function RequestGetPartyUrns(
    requestClient,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RequestGetPartyUrns(labels),
        "RequestGetPartyUrns",
    );

    /** @type {Array<string>|null} */
    let partyUrns = null;

    const succeed = check(res, {
        "RequestGetPartyUrns - status code is 200": (r) =>
            r.status === 200,
        "RequestGetPartyUrns - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return partyUrns;
    }

    check(res, {
        "RequestGetPartyUrns - body is valid": (r) => {
            try {
                partyUrns = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return partyUrns;
}
