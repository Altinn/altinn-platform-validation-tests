import { CreateAccessPackage } from "./connections/create-access-package.js";
import { CreateConnection } from "./connections/create-connection.js";
import { CreateInstanceRights } from "./connections/create-instance-rights.js";
import { CreateResourceRights } from "./connections/create-resource-rights.js";
import { DeleteAccessPackage } from "./connections/delete-access-package.js";
import { DeleteConnection } from "./connections/delete-connection.js";
import { DeleteInstance } from "./connections/delete-instance.js";
import { DeleteResource } from "./connections/delete-resource.js";
import { DeleteRole } from "./connections/delete-role.js";
import { GetAccessPackageDelegationCheck } from "./connections/get-access-package-delegation-check.js";
import { GetAccessPackages } from "./connections/get-access-packages.js";
import { GetConnectionUsers } from "./connections/get-connection-users.js";
import { GetConnections } from "./connections/get-connections.js";
import { GetInstanceDelegationCheck } from "./connections/get-instance-delegation-check.js";
import { GetInstanceRights } from "./connections/get-instance-rights.js";
import { GetInstanceUsers } from "./connections/get-instance-users.js";
import { GetInstances } from "./connections/get-instances.js";
import { GetResourceDelegationCheck } from "./connections/get-resource-delegation-check.js";
import { GetResourceRights } from "./connections/get-resource-rights.js";
import { GetResources } from "./connections/get-resources.js";
import { GetRoles } from "./connections/get-roles.js";
import { UpdateInstanceRights } from "./connections/update-instance-rights.js";
import { UpdateResourceRights } from "./connections/update-resource-rights.js";

export const EndUserBuildingBlocks = {
    Connections: {
        CreateAccessPackage,
        CreateConnection,
        CreateInstanceRights,
        CreateResourceRights,
        DeleteAccessPackage,
        DeleteConnection,
        DeleteInstance,
        DeleteResource,
        DeleteRole,
        GetAccessPackageDelegationCheck,
        GetAccessPackages,
        GetConnectionUsers,
        GetConnections,
        GetInstanceDelegationCheck,
        GetInstanceRights,
        GetInstanceUsers,
        GetInstances,
        GetResourceDelegationCheck,
        GetResourceRights,
        GetResources,
        GetRoles,
        UpdateInstanceRights,
        UpdateResourceRights

    }
};
