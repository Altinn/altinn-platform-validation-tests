export { handleSummary } from "../../../../../common-imports.js";
import { group } from "k6";

import { RolesGetRolePackagesByIdQueryBuilder } from "../../../../../clients/access-management/metadata/roles/index.js";
import { getOptions } from "../../../../../helpers.js";
import { MetadataBuildingBlocks } from "../../../../building-blocks/access-management/metadata/index.js";
import { PackagesDomainChecks } from "../../../../domain-checks/access-management/metadata/packages.js";
import { getClients, setup } from "../common.js";

export { setup };

const labels = { step: "getRolePackagesById" };
const groupLabel = "get-role-packages-by-id";

export const options = getOptions([labels]);

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    group(groupLabel, function () {
        const query = new RolesGetRolePackagesByIdQueryBuilder()
            .WithVariant("ENK")
            .Build();

        const expectedPackages = [{ id: "2f176732-b1e9-449b-9918-090d1fa986f6", name: "Ansvarlig revisor", urn: "urn:altinn:accesspackage:ansvarlig-revisor", areaName: "Fullmakter for revisor", areaUrn: "accesspackage:area:fullmakter_for_revisor", typeName: "Organisasjon" }, { id: "96120c32-389d-46eb-8212-0a6540540c25", name: "Revisormedarbeider", urn: "urn:altinn:accesspackage:revisormedarbeider", areaName: "Fullmakter for revisor", areaUrn: "accesspackage:area:fullmakter_for_revisor", typeName: "Organisasjon" }];

        const packageDtos = MetadataBuildingBlocks.Roles.GetRolePackagesById(rolesApiClient, "f76b997a-9bd8-4f7b-899f-fcd85d35669f", query, labels);

        expectedPackages.forEach(({ id }) => {
            const pkg = PackagesDomainChecks.FindPackage(packageDtos, id);
            const expectedPackage = expectedPackages.find((p) => p.id === id);

            PackagesDomainChecks.CheckPackageId(pkg, expectedPackage.id);
            PackagesDomainChecks.CheckPackageName(pkg, expectedPackage.name);
            PackagesDomainChecks.CheckPackageUrn(pkg, expectedPackage.urn);
            PackagesDomainChecks.CheckPackageAreaName(pkg, expectedPackage.areaName);
            PackagesDomainChecks.CheckPackageAreaUrn(pkg, expectedPackage.areaUrn);
            PackagesDomainChecks.CheckPackageTypeName(pkg, expectedPackage.typeName);
        });
    });
}
