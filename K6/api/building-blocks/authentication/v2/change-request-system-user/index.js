import { ChangeRequestSystemUserVendorCreate } from "./change-request-system-user-vendor-create.js";
import { ChangeRequestSystemUserVendorDelete } from "./change-request-system-user-vendor-delete.js";
import { ChangeRequestSystemUserVendorGet } from "./change-request-system-user-vendor-get.js";
import { ChangeRequestSystemUserVendorGetByExternalRef } from "./change-request-system-user-vendor-get-by-external-ref.js";
import { ChangeRequestSystemUserVendorGetBySystem } from "./change-request-system-user-vendor-get-by-system.js";

export const ChangeRequestSystemUserBuildingBlocks = {
    VendorCreate: ChangeRequestSystemUserVendorCreate,
    VendorDelete: ChangeRequestSystemUserVendorDelete,
    VendorGet: ChangeRequestSystemUserVendorGet,
    VendorGetByExternalRef: ChangeRequestSystemUserVendorGetByExternalRef,
    VendorGetBySystem: ChangeRequestSystemUserVendorGetBySystem,
};
