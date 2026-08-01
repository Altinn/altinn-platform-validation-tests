import { SystemUserGetByExternalId } from "./get-by-external-id.js";
import { SystemUserInternalStream } from "./internal-stream.js";
import { SystemUserUpdate } from "./update.js";
import { SystemUserVendorGetByQuery } from "./vendor-get-by-query.js";
import { SystemUserVendorGetBySystem } from "./vendor-get-by-system.js";

export const SystemUserBuildingBlocks = {
    GetByExternalId: SystemUserGetByExternalId,
    InternalStream: SystemUserInternalStream,
    Update: SystemUserUpdate,
    VendorGetByQuery: SystemUserVendorGetByQuery,
    VendorGetBySystem: SystemUserVendorGetBySystem,
};
