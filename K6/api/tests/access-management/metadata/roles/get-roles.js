export { handleSummary } from "../../../../../common-imports.js";
import { group } from "k6";

import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { getClients } from "./common.js";

export { setup } from "./common.js";;

const labels = { step: "getRoles" };
const groupLabel = "get-roles";

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 * Test: Get all roles and validate the response against expected values.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    group(groupLabel, function () {
        MetadataBuildingBlocks.Roles.GetRoles(rolesApiClient, labels);
    });
}
