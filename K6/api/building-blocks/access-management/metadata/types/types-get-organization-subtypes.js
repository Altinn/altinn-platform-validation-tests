import { check } from "k6";

import { TypesClient } from "../../../../clients/types/index.js";

/**
 * Gets organization sub types.
 *
 * @param {TypesClient} typesClient Client for the Types API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<SubTypeDto>|null} Organization sub types.
 */
export function TypesGetOrganizationSubTypes(
    typesClient,
    labels = null,
) {
    const res = typesClient.TypesGetOrganizationSubTypes(labels);

    /** @type {Array<SubTypeDto>|null} */
    let subTypes = null;

    const succeed = check(res, {
        "TypesGetOrganizationSubTypes - status code is 200": (r) =>
            r.status === 200,
        "TypesGetOrganizationSubTypes - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subTypes;
    }

    check(res, {
        "TypesGetOrganizationSubTypes - body is valid": (r) => {
            try {
                subTypes = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return subTypes;
}
