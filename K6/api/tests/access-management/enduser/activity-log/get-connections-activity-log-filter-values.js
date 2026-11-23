import { ActivityLogFilterField } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { PaginationDomainChecks } from "../../../../domain-checks/common/pagination.js";
import { getClients, useNextUser } from "./common.js";

export { setup } from "./common.js";

// The direction the test data holds entries in for this area, so the values
// are read from a filled log rather than an empty one.
const DIRECTION = "From";

// Labels for different actions
const getFilterValuesLabel = { step: "Get connections activity log filter values" };
const searchFilterValuesLabel = { step: "Search connections activity log filter values" };

// get k6 options
export const options = getOptions([getFilterValuesLabel, searchFilterValuesLabel]);

/**
 * Fills one filter dropdown of an organization's connections activity log the way
 * the portal does: lists the values the field can be filtered on, then
 * searches them with `term`, as when the user starts typing, and checks both
 * answers. Reads direction `From`, what the organization gave, since that is where the test data
 * holds entries. Walks through the fields the area supports, one per
 * iteration.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);
    const client = getClients().connections;
    const fields = data.filterFields.connections;
    const field = /** @type {ActivityLogFilterField} */ (fields[__ITER % fields.length]);

    const values = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterValues(
        client,
        field,
        new ActivityLogQueryBuilder().withParty(user.orgUuid).withDirection(DIRECTION).build(),
        getFilterValuesLabel,
    );
    if (values === null) {
        return;
    }

    const operation = `GetActivityLogFilterValues connections ${field}`;
    PaginationDomainChecks.CheckPaginatedShape(values, operation);
    ActivityLogDomainChecks.CheckFilterValuesHaveIds(values, operation);

    // Search with the start of a value's name, as a user typing it would. A
    // field with no named values has nothing to search for.
    const value = (values.data ?? []).find((candidate) => (candidate.name ?? "").length >= 3);
    if (value === undefined) {
        return;
    }
    const term = (value.name ?? "").slice(0, 3).toLowerCase();

    const found = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterValues(
        client,
        field,
        new ActivityLogQueryBuilder().withParty(user.orgUuid).withDirection(DIRECTION).withTerm(term).build(),
        searchFilterValuesLabel,
    );
    if (found !== null) {
        ActivityLogDomainChecks.CheckFilterValuesMatchTerm(found, term, value.id, `${operation} term`);
    }
}
