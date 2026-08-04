import { check } from "k6";

import { DelegationExportClient } from "../../../../../clients/access-management-bff/delegation-export/index.js";

/**
 * Exports the delegations of a party as a spreadsheet.
 *
 * @param {DelegationExportClient} delegationExportClient Client for the
 * delegation export endpoints.
 * @param {GetDelegationExportQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetDelegationExportQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse} The raw response, holding the exported file.
 */
export function GetDelegationExport(
    delegationExportClient,
    queryParams = null,
    labels = null,
) {
    const res = delegationExportClient.GetDelegationExport(
        queryParams,
        labels,
    );

    const succeed = check(res, {
        "GetDelegationExport - status code is 200": (r) =>
            r.status === 200,
        "GetDelegationExport - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
