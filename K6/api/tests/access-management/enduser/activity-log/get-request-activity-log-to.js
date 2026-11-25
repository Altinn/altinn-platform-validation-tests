import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { PaginationDomainChecks } from "../../../../domain-checks/common/pagination.js";
import { getClients, useNextUser } from "./common.js";

export { setup } from "./common.js";

// Labels for different actions
const getActivityLogLabel = { step: "Get request activity log to" };

// get k6 options
export const options = getOptions([getActivityLogLabel]);

/**
 * Reads the first page of an organization's request activity log in direction
 * `To`, what went to the organization, as the daglig leder does in the portal,
 * and checks that every entry is valid and has the organization as `toId`.
 *
 * Every test organization has received requests, so the log must hold entries.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);

    const query = new ActivityLogQueryBuilder()
        .withParty(user.orgUuid)
        .withDirection("To")
        .build();

    const log = EndUserBuildingBlocks.ActivityLog.GetActivityLog(getClients().request, query, getActivityLogLabel);
    if (log === null) {
        return;
    }

    const operation = "GetActivityLog request To";
    PaginationDomainChecks.CheckPaginatedShape(log, operation);
    PaginationDomainChecks.CheckPaginatedNotEmpty(log, operation);
    ActivityLogDomainChecks.CheckEntriesValid(log, operation);
    ActivityLogDomainChecks.CheckEntriesMatchDirection(log, user.orgUuid, "To", operation);
}
