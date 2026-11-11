/**
 * Request single rights on a resource and approve some of them.
 *
 * Per iteration two unique users are drawn:
 * - User A: a person acting for themselves; asks for read and write.
 * - User B: daglig leder of Organization B; receives the request and approves read only.
 *
 * Steps:
 * 1. (Arrange) Organization B adds User A as a connection, so there is a relation
 * the request can be made against. Requires pid + last name.
 * 2. User A asks Organization B for read and write on the resource.
 * 3. User B lists received requests and finds the one from step 2.
 * 4. User B approves read only, on behalf of Organization B, and the request
 * reads back as PartialApprove with read approved.
 * 5. (Cleanup) Organization B removes the connection again, with cascade, so the
 * right the approval delegated goes with it.
 *
 * Without step 5 the rights would pile up: each iteration delegates read on the
 * connection and removes nothing, so after enough runs step 4 would only give
 * again what is already there.
 *
 * All calls use personal enduser tokens; the active user's token is swapped
 * between steps through the shared token generator. The right keys are read in
 * setup, see common.js.
 */

import { fail, group } from "k6";

import { CreateConnectionQueryBuilder, DeleteConnectionQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { ReceivedRequestsV2QueryBuilder, RequestStatusV2 } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { getOptions, pickUnique } from "../../../../../helpers.js";
import { CreateConnection, DeleteConnection } from "../../../../building-blocks/access-management/enduser/connections/index.js";
import { ApproveReceivedRequest, CreateResourceRequest, GetReceivedRequests, GetRequest } from "../../../../building-blocks/access-management/enduser/request-v2/index.js";
import { RequestV2DomainChecks } from "../../../../domain-checks/access-management/enduser/request-v2.js";
import { getClients, getEnduserOpts, RESOURCE, setup } from "./common.js";

export { setup };

const groupLabel = "0. Request single rights and approve a subset";
const addConnectionLabel = { step: "1. Organization B adds User A (connection)" };
const requestLabel = { step: "2. User A requests read and write" };
const getReceivedLabel = { step: "3. User B gets received request" };
const approveLabel = { step: "4. User B approves read only" };
const getRequestLabel = { step: "4b. User B reads the request back" };
const cleanupLabel = { step: "5. Organization B removes the connection" };

export const options = getOptions([
    addConnectionLabel,
    requestLabel,
    getReceivedLabel,
    approveLabel,
    getRequestLabel,
    cleanupLabel,
]);

/**
 * @param {ReturnType<typeof setup>} data Test data from setup.
 * @returns {void}
 */
export default function (data) {
    const { connections, requests, tokenGenerator } = getClients();

    // User A (asks, as themselves) and User B (daglig leder of Organization B, approves).
    const [a, b] = pickUnique(data.users, 2);
    const requestedKeys = [data.rightKeys.read, data.rightKeys.write];
    const approvedKeys = [data.rightKeys.read];

    group(groupLabel, function () {
        // Step 1: Organization B adds User A as a connection (B's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b));
        CreateConnection(
            connections,
            new CreateConnectionQueryBuilder()
                .withParty(b.orgUuid)
                .build(),
            { personIdentifier: a.pid, lastName: a.lastName },
            addConnectionLabel,
        );

        // Step 2: User A asks Organization B for read and write (A's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a));
        const request = CreateResourceRequest(
            requests,
            a.partyUuid,
            b.orgUuid,
            RESOURCE,
            { requestedRightKeys: requestedKeys },
            requestLabel,
        );

        RequestV2DomainChecks.CheckRequestStatus(request, RequestStatusV2.Pending, "CreateResourceRequest");
        RequestV2DomainChecks.CheckRequestedRightKeys(request, requestedKeys, "CreateResourceRequest");

        // Step 3: User B lists received requests and finds the new one (B's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b));
        const received = GetReceivedRequests(
            requests,
            new ReceivedRequestsV2QueryBuilder()
                .withParty(b.orgUuid)
                .withFrom(a.partyUuid)
                .withStatus([RequestStatusV2.Pending])
                .build(),
            null,
            null,
            getReceivedLabel,
        );

        if (!RequestV2DomainChecks.CheckRequestReceived(received, request?.id, "GetReceivedRequests") || request === null) {
            // Step 5 runs anyway, so the connection does not stay behind.
            cleanup(a, b);
            fail("cannot approve: the request from step 2 is not among the ones Organization B received");
        }

        // Step 4: User B approves read only, on behalf of Organization B.
        const approved = ApproveReceivedRequest(
            requests,
            b.orgUuid,
            request.id,
            { rightKeys: approvedKeys },
            approveLabel,
        );

        RequestV2DomainChecks.CheckRequestStatus(approved, RequestStatusV2.PartialApprove, "ApproveReceivedRequest");
        RequestV2DomainChecks.CheckApprovedRightKeys(approved, approvedKeys, "ApproveReceivedRequest");

        // Read back rather than trusting the echo: the approve response and the
        // stored request are built by different code, and the stored one is what
        // the portal shows.
        const stored = GetRequest(requests, b.orgUuid, request.id, getRequestLabel);

        RequestV2DomainChecks.CheckRequestStatus(stored, RequestStatusV2.PartialApprove, "GetRequest");
        RequestV2DomainChecks.CheckRequestedRightKeys(stored, requestedKeys, "GetRequest");
        RequestV2DomainChecks.CheckApprovedRightKeys(stored, approvedKeys, "GetRequest");

        // Step 5: remove the connection again (B's token).
        cleanup(a, b);
    });
}

/**
 * Organization B removes the connection to User A, with cascade, so the right
 * the approval delegated goes with it and the iteration leaves nothing behind.
 *
 * @param {import("./common.js").EnduserRow} a User A, the person who asked.
 * @param {import("./common.js").EnduserRow} b User B, daglig leder of Organization B.
 * @returns {void}
 */
function cleanup(a, b) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b));
    DeleteConnection(
        connections,
        new DeleteConnectionQueryBuilder()
            .withParty(b.orgUuid)
            .withFrom(b.orgUuid)
            .withTo(a.partyUuid)
            .withCascade(true)
            .build(),
        cleanupLabel,
    );
}
