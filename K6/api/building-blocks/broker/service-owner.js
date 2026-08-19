import { check } from "k6";

import { ServiceOwnerClient } from "../../../clients/broker/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Initializes the service owner for the calling organization within the broker service.
 *
 * @param {ServiceOwnerClient} serviceOwnerClient Client for the Broker Service Owner API.
 * @param {ServiceOwnerInitializeExt} request Service owner initialization request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the service owner was successfully initialized.
 */
export function InitializeServiceOwner(
    serviceOwnerClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerClient.InitializeServiceOwner(
            request,
            labels,
        ),
        "InitializeServiceOwner",
    );

    return check(res, {
        "InitializeServiceOwner - status code is 200": (r) =>
            r.status === 200,
        "InitializeServiceOwner - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}

/**
 * Retrieves the service owner for the calling organization within the broker service.
 *
 * @param {ServiceOwnerClient} serviceOwnerClient Client for the Broker Service Owner API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ServiceOwnerOverviewExt|null} Service owner overview information.
 */
export function GetServiceOwner(
    serviceOwnerClient,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerClient.GetServiceOwner(labels),
        "GetServiceOwner",
    );

    /** @type {ServiceOwnerOverviewExt|null} */
    let serviceOwner = null;

    const succeed = check(res, {
        "GetServiceOwner - status code is 200": (r) =>
            r.status === 200,
        "GetServiceOwner - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return serviceOwner;
    }

    check(res, {
        "GetServiceOwner - body is valid": (r) => {
            try {
                serviceOwner = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return serviceOwner;
}
