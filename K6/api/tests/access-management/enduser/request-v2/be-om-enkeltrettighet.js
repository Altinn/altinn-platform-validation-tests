import { fail, group } from "k6";
import exec from "k6/execution";

import { ReceivedRequestsV2QueryBuilder, RequestStatusV2 } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { ApproveReceivedRequest, CreateResourceRequest, GetReceivedRequests, GetRequest } from "../../../../building-blocks/access-management/enduser/request-v2/index.js";
import { RequestV2DomainChecks } from "../../../../domain-checks/access-management/enduser/request-v2.js";
import { getClients, getEnduserOpts, removeConnections, RESOURCE, setup } from "./common.js";

export { setup };

const requestLabel = { step: "1. Person requests read and write on the resource" };
const getReceivedLabel = { step: "2. Daglig leder lists received requests" };
const approveLabel = { step: "3. Daglig leder approves read only" };
const getRequestLabel = { step: "4. Daglig leder reads the request back" };
const removeConnectionLabel = { step: "5. Organization removes the connection" };

export const options = getOptions([
    requestLabel,
    getReceivedLabel,
    approveLabel,
    getRequestLabel,
    removeConnectionLabel,
]);

/**
 * Test: a person asks an organization for some of the rights on a resource, and
 * the daglig leder approves fewer of them than were asked for.
 *
 * One pair per iteration, drawn by __ITER from this VU's slice, so the test
 * scales the way a smoke or breakpoint run expects. The connection the request
 * needs is in place from setup, so the iteration is only the request flow. How
 * many iterations a run gets is set by functional.yaml and smoke.yaml, not here.
 *
 * @param {ReturnType<typeof setup>} data Test data, one slice of pairs per VU.
 * @returns {void}
 */
export default function (data) {
    const { person, org } = getItemFromList(data.pairs[exec.vu.idInTest - 1]);
    const { requests, tokenGenerator } = getClients();

    const requestedKeys = ["read", "write"];
    const approvedKeys = ["read"];

    group("Request single rights and approve a subset", function () {
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(person));
        const request = CreateResourceRequest(
            requests,
            person.partyUuid,
            org.orgUuid,
            RESOURCE,
            { requestedRightKeys: requestedKeys },
            requestLabel,
        );

        RequestV2DomainChecks.CheckRequestStatus(request, RequestStatusV2.Pending, "CreateResourceRequest");
        RequestV2DomainChecks.CheckRequestedRightKeys(request, requestedKeys, "CreateResourceRequest");

        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(org));
        const received = GetReceivedRequests(
            requests,
            new ReceivedRequestsV2QueryBuilder()
                .withParty(org.orgUuid)
                .withFrom(person.partyUuid)
                .withStatus([RequestStatusV2.Pending])
                .build(),
            null,
            null,
            getReceivedLabel,
        );

        // Nothing below says anything without the request to approve. Ending the
        // iteration here leaves the request pending, which blocks nothing: the
        // next iteration on the pair makes a new one.
        if (!RequestV2DomainChecks.CheckRequestReceived(received, request?.id, "GetReceivedRequests") || request === null) {
            fail("cannot approve: the request is not among the ones the organization received");
        }

        const approved = ApproveReceivedRequest(
            requests,
            org.orgUuid,
            request.id,
            { rightKeys: approvedKeys },
            approveLabel,
        );

        RequestV2DomainChecks.CheckRequestStatus(approved, RequestStatusV2.PartialApprove, "ApproveReceivedRequest");
        RequestV2DomainChecks.CheckApprovedRightKeys(approved, approvedKeys, "ApproveReceivedRequest");

        // Read back rather than trusting the echo: the approve response and the
        // stored request are built by different code, and the stored one is what
        // the portal shows.
        const stored = GetRequest(requests, org.orgUuid, request.id, getRequestLabel);

        RequestV2DomainChecks.CheckRequestStatus(stored, RequestStatusV2.PartialApprove, "GetRequest");
        RequestV2DomainChecks.CheckRequestedRightKeys(stored, requestedKeys, "GetRequest");
        RequestV2DomainChecks.CheckApprovedRightKeys(stored, approvedKeys, "GetRequest");
    });
}

/**
 * Removes the connections setup made, and with them the rights the approvals
 * delegated.
 *
 * @param {ReturnType<typeof setup>} data Test data, one slice of pairs per VU.
 * @returns {void}
 */
export function teardown(data) {
    removeConnections(data, removeConnectionLabel);
}
