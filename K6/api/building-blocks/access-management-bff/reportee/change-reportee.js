import { check } from "k6";

import { ReporteeClient } from "../../../../clients/access-management-bff/reportee/index.js";
import { ChangeReporteeQuery } from "../../../../clients/access-management-bff/reportee/reportee.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Changes the reportee of the authenticated user.
 *
 * @param {ReporteeClient} reporteeClient Client for the reportee endpoints.
 * @param {ChangeReporteeQuery|null} [queryParams] Optional query parameters.
 * Use {@link ChangeReporteeQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the reportee was changed.
 */
export function ChangeReportee(
    reporteeClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => reporteeClient.ChangeReportee(queryParams, labels),
        "ChangeReportee",
    );

    let changed = false;

    const succeed = check(res, {
        "ChangeReportee - status code is 200": (r) =>
            r.status === 200,
        "ChangeReportee - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changed;
    }

    changed = true;

    return changed;
}
