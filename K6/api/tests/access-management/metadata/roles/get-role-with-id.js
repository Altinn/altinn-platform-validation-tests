export { handleSummary } from "../../../../../common-imports.js";
import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { RolesDomainChecks } from "../../../../domain-checks/access-management/metadata/roles.js";
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

    const response = MetadataBuildingBlocks.Roles.GetRole(rolesApiClient, "18baa914-ac43-4663-9fa4-6f5760dc68eb", labels);
    const role = RolesDomainChecks.FindRole(response, "18baa914-ac43-4663-9fa4-6f5760dc68eb");

    RolesDomainChecks.CheckRoleId(role, "18baa914-ac43-4663-9fa4-6f5760dc68eb", labels);
    RolesDomainChecks.CheckRoleName(role, "Deltaker delt ansvar");
    RolesDomainChecks.CheckRoleIsKeyRole(role, true);
    RolesDomainChecks.CheckRoleUrn(role, "urn:altinn:external-role:ccr:deltaker-delt-ansvar");
    RolesDomainChecks.CheckRoleLegacyRoleCode(role, "dtpr");
    RolesDomainChecks.CheckRoleProviderCode(role, "sys-ccr");
    RolesDomainChecks.CheckRoleProviderName(role, "Enhetsregisteret");
}
