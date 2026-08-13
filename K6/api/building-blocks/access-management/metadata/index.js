import {
    PackagesExport,
    PackagesGetAreaById,
    PackagesGetAreaPackagesById,
    PackagesGetGroup,
    PackagesGetGroupAreasById,
    PackagesGetGroupById,
    PackagesGetPackageById,
    PackagesGetPackageByUrn,
    PackagesGetPackageResourcesById,
    PackagesSearch
} from "./packages/index.js";
import {
    RolesGetRole,
    RolesGetRolePackages,
    RolesGetRolePackagesById,
    RolesGetRoleResources,
    RolesGetRoleResourcesById,
    RolesGetRoles
} from "./roles/index.js";
import { TypesGetOrganizationSubTypes }
    from "./types/index.js";

export const MetadataBuildingBlocks = {
    Roles: {
        GetRole: RolesGetRole,
        GetRolePackages: RolesGetRolePackages,
        GetRolePackagesById: RolesGetRolePackagesById,
        GetRoleResources: RolesGetRoleResources,
        GetRoleResourcesById: RolesGetRoleResourcesById,
        GetRoles: RolesGetRoles,
    },
    Packages: {
        Export: PackagesExport,
        GetAreaById: PackagesGetAreaById,
        GetAreaPackagesById: PackagesGetAreaPackagesById,
        GetGroup: PackagesGetGroup,
        GetGroupAreasById: PackagesGetGroupAreasById,
        GetGroupById: PackagesGetGroupById,
        GetPackageById: PackagesGetPackageById,
        GetPackageByUrn: PackagesGetPackageByUrn,
        GetPackageResourcesById: PackagesGetPackageResourcesById,
        Search: PackagesSearch
    },
    Types: {
        GetOrganizationSubTypes: TypesGetOrganizationSubTypes
    }
};
