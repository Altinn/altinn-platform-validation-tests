import { AccessManagementPartiesQuery } from "./access-management-parties-query.js";
import { AddCcrRoleToEr } from "./add-ccr-role-to-er.js";
import { GetCustomers } from "./get-customers.js";
import { GetRoleHolders } from "./get-role-holders.js";
import { RemoveCcrRoleFromEr } from "./remove-ccr-role-from-er.js";

export const RegisterBuildingBlocks = {
    AccessManagementPartiesQuery: AccessManagementPartiesQuery,
    GetCustomers: GetCustomers,
    GetRoleHolders: GetRoleHolders,
};

// The ER update service is not part of Register. It sits here because the only
// reason the tests touch it is to produce a role change and then assert that
// Register picked it up.
export const EnhetsregisteretBuildingBlocks = {
    AddCcrRoleToEr: AddCcrRoleToEr,
    RemoveCcrRoleFromEr: RemoveCcrRoleFromEr,
};
