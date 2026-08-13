export { handleSummary } from "../../../../../common-imports.js";
import { group } from "k6";

import { RolesGetRoleResourcesQueryBuilder } from "../../../../../clients/access-management/metadata/roles/index.js";
import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { getClients, setup } from "../common.js";

export { setup };

const labels = { step: "GetRoleResources" };
const groupLabel = "get-role-resources";

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    group(groupLabel, function () {
        const query = new RolesGetRoleResourcesQueryBuilder()
            .WithRole("daglig-leder")
            .WithVariant("AS")
            .Build();

        MetadataBuildingBlocks.Roles.GetRoleResources(rolesApiClient, query, labels);
    });
}
