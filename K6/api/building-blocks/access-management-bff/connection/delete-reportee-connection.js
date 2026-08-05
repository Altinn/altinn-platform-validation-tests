import { check } from "k6";

import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";

/**
 * Removes a connection between a reportee and a right holder.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {DeleteReporteeConnectionQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteReporteeConnectionQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the connection was removed.
 */
export function DeleteReporteeConnection(
    connectionClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionClient.DeleteReporteeConnection(queryParams, labels);

    let removed = false;

    const succeed = check(res, {
        "DeleteReporteeConnection - status code is 200": (r) =>
            r.status === 200,
        "DeleteReporteeConnection - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
