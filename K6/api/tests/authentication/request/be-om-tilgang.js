/**
 * Be om tilgang (request access) flow.
 *
 * Per iteration two unique users and one random access package are picked:
 *   - Bruker A: requests the access package.
 *   - Bruker B: daglig leder of Virksomhet B; receives and approves the request.
 *   - The access package is a random one picked from metadata API
 *
 * Steps:
 *   1. (Prerequisite) Virksomhet B adds Bruker A as a connection (assignment), so
 *      a relationship exists before A can request access. A is added via the body
 *      (personidentifier + lastName). Issued with B's token.
 *   2. Bruker A requests the access package, directed to Virksomhet B. A's token.
 *   3. Bruker B lists its received requests (party = b.orgUuid, status Pending)
 *      and finds the one just created. B's token.
 *   4. Bruker B approves the request on behalf of Virksomhet B (party = b.orgUuid).
 *      B is daglig leder, so steps 3-4 are plain enduser requests needing no
 *      extra authorization. B's token.
 *
 * All calls use enduser personal (Altinn) tokens; the active user's token is
 * switched between steps via the shared token generator.
 */

import { group } from "k6";

import { ReceivedRequestsParamsBuilder, RequestStatus } from "../../../../clients/authentication/index.js";
import { getItemFromList, getOptions, pickUnique } from "../../../../helpers.js";
import { PostConnection } from "../../../building-blocks/authentication/connections/index.js";
import { Approve, GetReceived, PostPackage } from "../../../building-blocks/authentication/request/index.js";
import { getClients, getEnduserOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

const groupLabel = "0. Be om tilgang til tilgangspakke";
const addAssignmentLabel = { step: "1. Virksomhet B adds Bruker A (assignment)" };
const requestPackageLabel = { step: "2. Bruker A requests access package" };
const getReceivedLabel = { step: "3. Bruker B gets received request" };
const approveLabel = { step: "4. Bruker B approves request" };

export const options = getOptions([
    addAssignmentLabel,
    requestPackageLabel,
    getReceivedLabel,
    approveLabel,
]);

export default function (data) {
    const [connectionsApiClient, requestApiClient, tokenGenerator] = getClients();

    // Bruker A (requester) and Bruker B (daglig leder of Virksomhet B, the approver).
    const [a, b] = pickUnique(data.users, 2);
    const accessPackage = getItemFromList(data.packages, true);

    group(groupLabel, function () {
        // Step 1: Virksomhet B adds Bruker A as a connection (B's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        PostConnection(
            connectionsApiClient,
            { party: b.orgUuid, from: b.orgUuid },
            { personidentifier: a.pid, lastName: a.lastName },
            addAssignmentLabel,
        );

        // Step 2: Bruker A requests the access package for Virksomhet B (A's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a.pid, a.partyUuid));
        const request = PostPackage(
            requestApiClient,
            a.partyUuid,
            b.orgUuid,
            accessPackage,
            requestPackageLabel,
        );

        // Steps 3-4: Bruker B lists received requests and approves the new one (B's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        const received = GetReceived(
            requestApiClient,
            new ReceivedRequestsParamsBuilder()
                .withParty(b.orgUuid)
                .withStatus(RequestStatus.Pending)
                .build(),
            getReceivedLabel,
        );

        const requestId = received.data.find((r) => r.id === request.id)?.id ?? request.id;

        Approve(
            requestApiClient,
            { party: b.orgUuid, id: requestId },
            [],
            approveLabel,
        );
    });
}
