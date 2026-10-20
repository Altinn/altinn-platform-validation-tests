import { ActivityLogFilterField } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { PaginationDomainChecks } from "../../../../domain-checks/common/pagination.js";
import { getClients, useNextUser } from "./common.js";

export { setup } from "./common.js";

// Labels for different actions
const getFilterValuesLabel = { step: "Get maskinporten activity log filter values" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getFilterValuesLabel, tokenGeneratorLabel]);

/**
 * Lists the values one field of an organization's maskinporten activity log can be
 * filtered on, as the portal does to fill a filter dropdown, and checks that
 * every value has an id. Walks through the fields the area supports, one per
 * iteration.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);
    const fields = data.filterFields.maskinporten;
    const field = /** @type {ActivityLogFilterField} */ (fields[__ITER % fields.length]);

    const query = new ActivityLogQueryBuilder()
        .withParty(user.orgUuid)
        .withDirection("To")
        .build();

    const values = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterValues(
        getClients().maskinporten,
        field,
        query,
        getFilterValuesLabel,
    );
    if (values === null) {
        return;
    }

    const operation = `GetActivityLogFilterValues maskinporten ${field}`;
    PaginationDomainChecks.CheckPaginatedShape(values, operation);
    ActivityLogDomainChecks.CheckFilterValuesHaveIds(values, operation);
}
