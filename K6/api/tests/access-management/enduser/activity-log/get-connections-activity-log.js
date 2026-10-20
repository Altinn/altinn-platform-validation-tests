import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { getClients, useNextUser } from "./common.js";

export { setup } from "./common.js";

// Labels for different actions
const getActivityLogToLabel = { step: "Get connections activity log to" };
const getActivityLogFromLabel = { step: "Get connections activity log from" };
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

// get k6 options
export const options = getOptions([getActivityLogToLabel, getActivityLogFromLabel, tokenGeneratorLabel]);

/**
 * Reads the first page of an organization's connections activity log, both
 * directions, as the daglig leder does when opening the log in the portal.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);
    const client = getClients().connections;

    /** @type {Array<{direction: "To"|"From", label: {[key: string]: string}}>} */
    const views = [
        { direction: "To", label: getActivityLogToLabel },
        { direction: "From", label: getActivityLogFromLabel },
    ];

    for (const { direction, label } of views) {
        const query = new ActivityLogQueryBuilder()
            .withParty(user.orgUuid)
            .withDirection(direction)
            .build();

        EndUserBuildingBlocks.ActivityLog.GetActivityLog(client, query, label);
    }
}
