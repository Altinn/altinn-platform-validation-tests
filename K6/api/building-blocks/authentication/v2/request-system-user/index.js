import { ApproveSystemUserRequest } from "./approve-system-user-request.js";
import { CreateAgentRequest } from "./create-agent-request.js";
import { CreateRequest } from "./create-request.js";
import { DeleteRequestByRequestId } from "./delete-request-by-request-id.js";
import { GetAgentRequestByExternalRef } from "./get-agent-request-by-external-ref.js";
import { GetAgentSystemUserRequestByGuid } from "./get-agent-system-user-request-by-guid.js";
import { GetAllAgentRequestsForVendor } from "./get-all-agent-requests-for-vendor.js";
import { GetAllRequestsForVendor } from "./get-all-requests-for-vendor.js";
import { GetRequestByExternalRef } from "./get-request-by-external-ref.js";
import { GetRequestByGuid } from "./get-request-by-guid.js";

export const RequestSystemUserBuildingBlocks = {
    ApproveSystemUserRequest,
    CreateAgentRequest,
    CreateRequest,
    DeleteRequestByRequestId,
    GetAgentRequestByExternalRef,
    GetAgentSystemUserRequestByGuid,
    GetAllAgentRequestsForVendor,
    GetAllRequestsForVendor,
    GetRequestByExternalRef,
    GetRequestByGuid,
};
