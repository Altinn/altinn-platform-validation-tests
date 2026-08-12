import { RolesGetRolePackagesByIdQueryBuilder } from "../../../../../clients/access-management/metadata/roles/index.js";
import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { getClients, setup } from "./common.js";

export { setup };

const labels = { step: "getRoles" };

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();
    const query = new RolesGetRolePackagesByIdQueryBuilder()
        .WithVariant("ENK")
        .Build();

    console.log("query: " + JSON.stringify(query));

    MetadataBuildingBlocks.Roles.GetRolePackagesById(rolesApiClient, "f76b997a-9bd8-4f7b-899f-fcd85d35669f", query, labels);
}
