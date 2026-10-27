import { fail } from "k6";

import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { PaginationDomainChecks } from "../../../../domain-checks/common/pagination.js";
import { getClients, lastNinetyDays, pickTypes, useNextUser } from "./common.js";

export { setup } from "./common.js";

// The direction the test data holds entries in for this area.
const DIRECTION = "From";

// The activity types the test data holds in that direction, as
// testdataGeneration/activity-log-data.js creates them. Filtering on any of the
// others would mostly come back empty.
/** @type {import("./common.js").ActivityTypeKey[]} */
const TYPES = [
    ["Assignment", null, "Created", null], // Rolletildeling opprettet
    ["Assignment", null, "Deleted", null], // Rolletildeling fjernet
];

// Labels for different actions
const getFilteredLabel = { step: "Get maskinporten activity log filtered" };

// get k6 options
export const options = getOptions([getFilteredLabel]);

/**
 * Reads an organization's maskinporten activity log the way the portal does when the
 * user filters it: on one activity type (`typeId`) and the last 90 days
 * (`after`/`before`), in direction `From`, what the organization gave. Checks that every entry is
 * valid, of that type, inside the window and the organization's. Walks through
 * the types the test data holds, one per iteration.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const types = pickTypes(data.types.maskinporten, TYPES);
    if (types.length === 0) {
        fail("None of the expected maskinporten activity types are listed by GET /activitylog/types");
    }

    const user = useNextUser(data);
    const type = types[__ITER % types.length];
    const { after, before } = lastNinetyDays();

    const query = new ActivityLogQueryBuilder()
        .withParty(user.orgUuid)
        .withDirection(DIRECTION)
        .withTypeId([type.id])
        .withAfter(after)
        .withBefore(before)
        .build();

    const log = EndUserBuildingBlocks.ActivityLog.GetActivityLog(getClients().maskinporten, query, getFilteredLabel);
    if (log === null) {
        return;
    }

    const operation = `GetActivityLog maskinporten From filtered on ${type.name}`;
    PaginationDomainChecks.CheckPaginatedShape(log, operation);
    ActivityLogDomainChecks.CheckEntriesValid(log, operation);
    ActivityLogDomainChecks.CheckEntriesMatchDirection(log, user.orgUuid, DIRECTION, operation);
    ActivityLogDomainChecks.CheckEntriesMatchTypes(log, [type], operation);
    ActivityLogDomainChecks.CheckEntriesWithinWindow(log, after, before, operation);
}
