import { check } from "k6";

import { SystemRegisterClient } from "../../../../clients/system-register/index.js";

/**
 * Retrieves the system change log.
 *
 * @param {SystemRegisterClient} systemRegisterClient Client for the System Register API.
 * @param {string} systemId System identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemChangeLog[]|null} Change log entries.
 */
export function SystemRegisterVendorGetChangeLog(
    systemRegisterClient,
    systemId,
    labels = null,
) {
    const res = systemRegisterClient.SystemRegisterVendorGetChangeLog(
        systemId,
        labels,
    );

    /** @type {SystemChangeLog[]|null} */
    let changeLog = null;

    const succeed = check(res, {
        "SystemRegisterVendorGetChangeLog - status code is 200": (r) =>
            r.status === 200,
        "SystemRegisterVendorGetChangeLog - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeLog;
    }

    check(res, {
        "SystemRegisterVendorGetChangeLog - body is valid": (r) => {
            try {
                changeLog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changeLog;
}
