export { handleSummary } from "../../../../../common-imports.js";
import { group } from "k6";

import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { RolesDomainChecks } from "../../../../domain-checks/access-management/metadata/roles.js";
import { getClients } from "../common.js";

/**
 * @typedef {import("../../../../domain-checks/access-management/metadata/roles.js").RoleDto} RoleDto
 */

const labels = { step: "getRoleWithId" };
const groupLabel = "get-role-with-id";

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    group(groupLabel, function () {
        /** @type {RoleDto} */
        const expectedRole = {
            id: "18baa914-ac43-4663-9fa4-6f5760dc68eb",
            name: "Deltaker delt ansvar",
            code: "deltaker-delt-ansvar",
            isKeyRole: true,
            urn: "urn:altinn:external-role:ccr:deltaker-delt-ansvar",
            legacyRoleCode: "dtpr",
            legacyUrn: "urn:altinn:rolecode:dtpr",
            provider: {
                code: "sys-ccr",
                name: "Enhetsregisteret",
            },
        };

        const roleDtos = MetadataBuildingBlocks.Roles.GetRole(rolesApiClient, expectedRole.id, labels);
        const role = RolesDomainChecks.FindRole(roleDtos, expectedRole.id);

        RolesDomainChecks.CheckRoleId(role, expectedRole.id);
        RolesDomainChecks.CheckRoleName(role, expectedRole.name);
        RolesDomainChecks.CheckRoleCode(role, expectedRole.code);
        RolesDomainChecks.CheckRoleIsKeyRole(role, expectedRole.isKeyRole);
        RolesDomainChecks.CheckRoleUrn(role, expectedRole.urn);
        RolesDomainChecks.CheckRoleLegacyRoleCode(role, expectedRole.legacyRoleCode);
        RolesDomainChecks.CheckRoleLegacyUrn(role, expectedRole.legacyUrn);
        RolesDomainChecks.CheckRoleProviderCode(role, expectedRole.provider.code);
        RolesDomainChecks.CheckRoleProviderName(role, expectedRole.provider.name);
    });
}
