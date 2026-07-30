import { SystemRegisterGet } from "./system-register-get.js";
import { SystemRegisterGetAccessPackages } from "./system-register-get-access-packages.js";
import { SystemRegisterGetRights } from "./system-register-get-rights.js";
import { SystemRegisterVendorCreate } from "./system-register-vendor-create.js";
import { SystemRegisterVendorDelete } from "./system-register-vendor-delete.js";
import { SystemRegisterVendorGet } from "./system-register-vendor-get.js";
import { SystemRegisterVendorGetById } from "./system-register-vendor-get-by-id.js";
import { SystemRegisterVendorGetChangeLog } from "./system-register-vendor-get-change-log.js";
import { SystemRegisterVendorUpdate } from "./system-register-vendor-update.js";
import { SystemRegisterVendorUpdateAccessPackages } from "./system-register-vendor-update-access-packages.js";
import { SystemRegisterVendorUpdateRights } from "./system-register-vendor-update-rights.js";

export const SystemRegister = {
    Get: SystemRegisterGet,
    GetAccessPackages: SystemRegisterGetAccessPackages,
    GetRights: SystemRegisterGetRights,
    VendorCreate: SystemRegisterVendorCreate,
    VendorDelete: SystemRegisterVendorDelete,
    VendorGet: SystemRegisterVendorGet,
    VendorGetById: SystemRegisterVendorGetById,
    VendorGetChangeLog: SystemRegisterVendorGetChangeLog,
    VendorUpdate: SystemRegisterVendorUpdate,
    VendorUpdateAccessPackages: SystemRegisterVendorUpdateAccessPackages,
    VendorUpdateRights: SystemRegisterVendorUpdateRights,
}