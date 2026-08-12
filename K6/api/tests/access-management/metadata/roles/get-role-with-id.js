import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { getClients } from "./common.js";

const labels = { step: "getRoles" };

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    MetadataBuildingBlocks.Roles.GetRole(rolesApiClient, "18baa914-ac43-4663-9fa4-6f5760dc68eb", labels);
}
