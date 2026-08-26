import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/authentication/index.js";
import { Right } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves default rights for a system.
 *
 * Requires the `altinn:portal/enduser` scope.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {boolean|null} [useOldFormatForApp] Whether to use old app format.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Right[]|null} Rights.
 */
export function SystemRegisterGetRightsFrontend(
    systemRegisterClient,
    systemId,
    useOldFormatForApp = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemRegisterClient.SystemRegisterGetRightsFrontend(
                systemId,
                useOldFormatForApp,
                labels,
            ),
        "SystemRegisterGetRightsFrontend",
    );

    /** @type {Right[]|null} */
    let rights = null;

    const succeed = check(res, {
        "SystemRegisterGetRightsFrontend - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterGetRightsFrontend - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rights;
    }

    check(res, {
        "SystemRegisterGetRightsFrontend - body is valid": (r) => {
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
