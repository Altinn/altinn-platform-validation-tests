export { handleSummary } from "../../../../../common-imports.js";
import { group } from "k6";

import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { getClients, setup } from "../common.js";

export { setup };

const labels = { step: "getRoles" };
const groupLabel = "get-roles";

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    group(groupLabel, function () {
        MetadataBuildingBlocks.Roles.GetRoles(rolesApiClient, labels);
    });
}
