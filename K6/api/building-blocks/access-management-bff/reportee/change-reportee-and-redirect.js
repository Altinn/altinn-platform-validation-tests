import { check } from "k6";

import { ReporteeClient } from "../../../../clients/access-management-bff/reportee/index.js";

/**
 * Changes the reportee of the authenticated user and redirects onwards.
 *
 * @param {ReporteeClient} reporteeClient Client for the reportee endpoints.
 * @param {ChangeReporteeAndRedirectQuery|null} [queryParams] Optional query
 * parameters. Use {@link ChangeReporteeAndRedirectQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse} The raw response, holding the redirect
 * target.
 */
export function ChangeReporteeAndRedirect(
    reporteeClient,
    queryParams = null,
    labels = null,
) {
    const res = reporteeClient.ChangeReporteeAndRedirect(queryParams, labels);

    const succeed = check(res, {
        "ChangeReporteeAndRedirect - status code is 200": (r) =>
            r.status === 200,
        "ChangeReporteeAndRedirect - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
