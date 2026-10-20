import { ActivityLogArea } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { getClients } from "./common.js";

// Labels for different actions
const getTypesLabel = { step: "Get activity log types" };
const getFilterFieldsLabel = { step: "Get activity log filter fields" };

// get k6 options
export const options = getOptions([getTypesLabel, getFilterFieldsLabel]);

/**
 * Reads the static activity log metadata of every area: the activity types
 * and the fields the log can be filtered on. Neither needs a token, so this
 * test needs no test data either.
 */
export default function () {
    const clients = getClients();

    for (const area of Object.values(ActivityLogArea)) {
        EndUserBuildingBlocks.ActivityLog.GetActivityLogTypes(clients[area], getTypesLabel);
        EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterFields(clients[area], getFilterFieldsLabel);
    }
}
