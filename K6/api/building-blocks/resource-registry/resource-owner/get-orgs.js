import { check } from "k6";

import { ResourceOwnerClient } from "../../../../clients/resource-registry/index.js";
import { OrgList } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the organization list.
 *
 * @param {ResourceOwnerClient} resourceOwnerClient Client for the Resource Owner API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {OrgList|null} Parsed response body, or null when the call failed.
 */
export function ResourceOwnerGetOrgs(
    resourceOwnerClient,
    labels = null,
) {
    const res = withRetries(
        () => resourceOwnerClient.ResourceOwnerGetOrgs(labels),
        "ResourceOwnerGetOrgs",
    );

    /** @type {OrgList|null} */
    let orgList = null;

    const succeed = check(res, {
        "ResourceOwnerGetOrgs - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return orgList;
    }

    check(res, {
        "ResourceOwnerGetOrgs - body is valid": (r) => {
            try {
                orgList = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return orgList;
}
