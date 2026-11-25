import { getOptions } from "../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { getMetadataClients } from "./common.js";

// Labels for different actions
const getTypesLabel = { step: "Get request activity log types" };
const getFilterFieldsLabel = { step: "Get request activity log filter fields" };

// get k6 options
export const options = getOptions([getTypesLabel, getFilterFieldsLabel]);

/**
 * Reads the static metadata of the request activity log, as the portal does
 * when it opens the log: the activity types and the fields the log can be
 * filtered on, and checks them. Neither needs a token, so this test needs
 * neither test data nor token generator credentials.
 */
export default function () {
    const client = getMetadataClients().request;

    const types = EndUserBuildingBlocks.ActivityLog.GetActivityLogTypes(client, getTypesLabel);
    if (types !== null) {
        ActivityLogDomainChecks.CheckActivityTypes(types, "request");
    }

    const fields = EndUserBuildingBlocks.ActivityLog.GetActivityLogFilterFields(client, getFilterFieldsLabel);
    if (fields !== null) {
        ActivityLogDomainChecks.CheckFilterFields(fields, "request");
    }
}
