import { check } from "k6";

import { DeleteReporteeConnectionQuery } from "../../../../clients/access-management-bff/connection/connection.types.js";
import { ConnectionClient } from "../../../../clients/access-management-bff/connection/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a connection between a reportee and a right holder.
 *
 * @param {ConnectionClient} connectionClient Client for the connection
 * endpoints.
 * @param {DeleteReporteeConnectionQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteReporteeConnectionQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the connection was removed.
 */
export function DeleteReporteeConnection(
    connectionClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionClient.DeleteReporteeConnection(queryParams, labels),
        "DeleteReporteeConnection",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteReporteeConnection - status code is 204": (r) =>
            r.status === 204,
        "DeleteReporteeConnection - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
