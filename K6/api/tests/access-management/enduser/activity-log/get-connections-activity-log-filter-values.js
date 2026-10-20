import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { getClients, useNextUser } from "./common.js";

export { setup } from "./common.js";

// Labels for different actions
const getFilterValuesLabel = { step: "Get connections activity log filter values" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getFilterValuesLabel, tokenGeneratorLabel]);

/**
 * Lists the values one field of an organization's connections activity log can be
 * filtered on, as the portal does to fill a filter dropdown. Walks through
 * the fields the area supports, one per iteration.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);
    const fields = data.filterFields.connections;
    const field = fields[__ITER % fields.length];

    const query = new ActivityLogQueryBuilder()
        .withParty(user.orgUuid)
        .withDirection("To")
        .build();

    EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterValues(
        getClients().connections,
        /** @type {import("../../../../../clients/access-management/enduser/activity-log/activity-log.types.js").ActivityLogFilterField} */ (field),
        query,
        getFilterValuesLabel,
    );
}
