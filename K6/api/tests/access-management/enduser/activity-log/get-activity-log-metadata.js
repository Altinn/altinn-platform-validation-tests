import { ActivityLogArea } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { getMetadataClients } from "./common.js";

// Labels for different actions, one per area so their stats stay apart
const getTypesLabels = Object.fromEntries(Object.values(ActivityLogArea).map((area) =>
    [area, { step: `Get ${area} activity log types` }]));
const getFilterFieldsLabels = Object.fromEntries(Object.values(ActivityLogArea).map((area) =>
    [area, { step: `Get ${area} activity log filter fields` }]));

// get k6 options
export const options = getOptions([...Object.values(getTypesLabels), ...Object.values(getFilterFieldsLabels)]);

/**
 * Reads the static activity log metadata of every area: the activity types
 * and the fields the log can be filtered on, and checks them. Neither needs a
 * token, so this test needs neither test data nor token generator credentials.
 */
export default function () {
    const clients = getMetadataClients();

    for (const area of Object.values(ActivityLogArea)) {
        const types = EndUserBuildingBlocks.ActivityLog.GetActivityLogTypes(clients[area], getTypesLabels[area]);
        if (types !== null) {
            ActivityLogDomainChecks.CheckActivityTypes(types, area);
        }

        const fields = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterFields(clients[area], getFilterFieldsLabels[area]);
        if (fields !== null) {
            ActivityLogDomainChecks.CheckFilterFields(fields, area);
        }
    }
}
