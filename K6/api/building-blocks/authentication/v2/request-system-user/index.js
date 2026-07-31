import { RequestSystemUserApprove } from "./request-system-user-approve.js";
import { RequestSystemUserVendorAgentCreate } from "./request-system-user-vendor-agent-create.js";
import { RequestSystemUserVendorAgentGet } from "./request-system-user-vendor-agent-get.js";
import { RequestSystemUserVendorAgentGetByExternalRef } from "./request-system-user-vendor-agent-get-by-external-ref.js";
import { RequestSystemUserVendorAgentGetBySystem } from "./request-system-user-vendor-agent-get-by-system.js";
import { RequestSystemUserVendorCreate } from "./request-system-user-vendor-create.js";
import { RequestSystemUserVendorDelete } from "./request-system-user-vendor-delete.js";
import { RequestSystemUserVendorGet } from "./request-system-user-vendor-get.js";
import { RequestSystemUserVendorGetByExternalRef } from "./request-system-user-vendor-get-by-external-ref.js";
import { RequestSystemUserVendorGetBySystem } from "./request-system-user-vendor-get-by-system.js";

export const RequestSystemUser = {
    Approve: RequestSystemUserApprove,
    VendorAgentCreate: RequestSystemUserVendorAgentCreate,
    VendorAgentGet: RequestSystemUserVendorAgentGet,
    VendorAgentGetByExternalRef: RequestSystemUserVendorAgentGetByExternalRef,
    VendorAgentGetBySystem: RequestSystemUserVendorAgentGetBySystem,
    VendorCreate: RequestSystemUserVendorCreate,
    VendorDelete: RequestSystemUserVendorDelete,
    VendorGet: RequestSystemUserVendorGet,
    VendorGetByExternalRef: RequestSystemUserVendorGetByExternalRef,
    VendorGetBySystem: RequestSystemUserVendorGetBySystem,
};
