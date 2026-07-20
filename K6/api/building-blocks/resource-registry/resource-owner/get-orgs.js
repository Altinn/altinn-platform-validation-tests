import { check } from "k6";

import { ResourceOwnerClient } from "../../../../clients/resource-owner/index.js";

/**
 * Gets the organization list.
 *
 * @param {ResourceOwnerClient} resourceOwnerClient Client for the Resource Owner API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {OrgList|null}
 */
export function ResourceOwnerGetOrgs(
    resourceOwnerClient,
    labels = null,
) {
    const res = resourceOwnerClient.ResourceOwnerGetOrgs(labels);

    /** @type {OrgList|null} */
    let orgList = null;

    const succeed = check(res, {
        "ResourceOwnerGetOrgs - status code is 200": (r) =>
            r.status === 200,
        "ResourceOwnerGetOrgs - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
