import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/access-management-bff/system-register/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the rights a registered system asks for.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the system
 * register endpoints.
 * @param {string} systemId System identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The rights of the system. The API does not publish a
 * schema for this response.
 */
export function GetRegisteredSystemRights(
    systemRegisterClient,
    systemId,
    labels = null,
) {
    const res = withRetries(
        () => systemRegisterClient.GetRegisteredSystemRights(
            systemId,
            labels,
        ),
        "GetRegisteredSystemRights",
    );

    /** @type {any} */
    let rights = null;

    const succeed = check(res, {
        "GetRegisteredSystemRights - status code is 200": (r) =>
            r.status === 200,
        "GetRegisteredSystemRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rights;
    }

    check(res, {
        "GetRegisteredSystemRights - body is valid": (r) => {
            try {
                rights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rights;
}
