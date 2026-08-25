import { check } from "k6";

import { AltinnCdnClient } from "../../../../clients/access-management-bff/altinn-cdn/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the organisation data the Altinn CDN publishes, keyed by org code.
 *
 * @param {AltinnCdnClient} altinnCdnClient Client for the Altinn CDN
 * endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} Organisation data keyed by org code, each value an
 * {@link OrgData}.
 */
export function GetOrgData(altinnCdnClient, labels = null) {
    const res = withRetries(
        () => altinnCdnClient.GetOrgData(labels),
        "GetOrgData",
    );

    /** @type {any} */
    let orgData = null;

    const succeed = check(res, {
        "GetOrgData - status code is 200": (r) =>
            r.status === 200,
        "GetOrgData - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return orgData;
    }

    check(res, {
        "GetOrgData - body is valid": (r) => {
            try {
                orgData = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return orgData;
}
