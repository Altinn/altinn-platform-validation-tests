import { check } from "k6";

import { ResourceCheckDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { GetSupplierResourceDelegationCheckQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether a resource can be delegated to a Maskinporten supplier.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {GetSupplierResourceDelegationCheckQuery} queryParams Query
 * parameters. Use {@link GetSupplierResourceDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceCheckDto|null} The delegation check result.
 */
export function GetSupplierResourceDelegationCheck(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.GetSupplierResourceDelegationCheck(
            queryParams,
            labels,
        ),
        "GetSupplierResourceDelegationCheck",
    );

    /** @type {ResourceCheckDto|null} */
    let resourceCheck = null;

    const succeed = check(res, {
        "GetSupplierResourceDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetSupplierResourceDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceCheck;
    }

    check(res, {
        "GetSupplierResourceDelegationCheck - body is valid": (r) => {
            try {
                resourceCheck = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceCheck;
}
