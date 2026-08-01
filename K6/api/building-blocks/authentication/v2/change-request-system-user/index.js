import { ApproveSystemUserChangeRequest } from "./approve-system-user-change-request.js";
import { CreateChangeRequest } from "./create-change-request.js";
import { DeleteChangeRequestByRequestId } from "./delete-change-request-by-request-id.js";
import { GetAllChangeRequestsForVendor } from "./get-all-change-requests-for-vendor.js";
import { GetChangeRequestByExternalRef } from "./get-change-request-by-external-ref.js";
import { GetChangeRequestByGuid } from "./get-change-request-by-guid.js";

export const ChangeRequestSystemUser = {
    ApproveSystemUserChangeRequest,
    CreateChangeRequest,
    DeleteChangeRequestByRequestId,
    GetAllChangeRequestsForVendor,
    GetChangeRequestByExternalRef,
    GetChangeRequestByGuid,
};
