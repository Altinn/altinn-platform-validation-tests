import { ActivityLogQueryBuilder } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { getOptions } from "../../../../../helpers.js";
import { PersonalTokenGenerator } from "../../../../../token-generator.js";
import { EndUserBuildingBlocks } from "../../../../building-blocks/access-management/enduser/index.js";
import { ActivityLogDomainChecks } from "../../../../domain-checks/access-management/enduser/activity-log.js";
import { PaginationDomainChecks } from "../../../../domain-checks/common/pagination.js";
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
 * directions, as the daglig leder does when opening the log in the portal, and
 * checks that every entry is valid and belongs to the organization on the side
 * the direction asks for.
 *
 * Every test organization has connections it gave (From), but not all
 * received one (To), so only `From` is required to hold entries.
 *
 * @param {import("./common.js").ActivityLogSetupData} data Setup data.
 */
export default function (data) {
    const user = useNextUser(data);
    const client = getClients().connections;

    /** @type {Array<{direction: "To"|"From", label: {[key: string]: string}, expectEntries: boolean}>} */
    const views = [
        { direction: "To", label: getActivityLogToLabel, expectEntries: false },
        { direction: "From", label: getActivityLogFromLabel, expectEntries: true },
    ];

    for (const { direction, label, expectEntries } of views) {
        const query = new ActivityLogQueryBuilder()
            .withParty(user.orgUuid)
            .withDirection(direction)
            .build();

        const log = EndUserBuildingBlocks.ActivityLog.GetActivityLog(client, query, label);
        if (log === null) {
            continue;
        }

        const operation = `GetActivityLog connections ${direction}`;
        PaginationDomainChecks.CheckPaginatedShape(log, operation);
        if (expectEntries) {
            PaginationDomainChecks.CheckPaginatedNotEmpty(log, operation);
        }
        ActivityLogDomainChecks.CheckEntriesValid(log, operation);
        ActivityLogDomainChecks.CheckEntriesMatchDirection(log, user.orgUuid, direction, operation);
    }
}
