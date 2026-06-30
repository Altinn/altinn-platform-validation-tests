/**
 * Be om tilgang (request access) flow.
 *
 * Two unique users are picked per iteration:
 *   - Bruker A: requests an access package. Represents Virksomhet A
 *   - Bruker B: processes (approves) the request.
 *
 * Steps:
 *   1. (Prerequisite) Virksomhet A grants Bruker B an assignment, so B can act
 *      on behalf of the organization the request is directed to. This is issued
 *      with Bruker A's token, since A is daglig leder of (represents) Virksomhet A.
 *   2. Bruker A requests the Jordbruk access package, directed to Virksomhet A.
 *   3. Bruker B fetches the received request and approves it on behalf of
 *      Virksomhet A (the same user both lists and approves).
 *
 * All calls use enduser personal (Altinn) tokens; the active user's token is
 * switched between steps via the shared token generator.
 */

import { group } from "k6";

import { ReceivedRequestsParamsBuilder, RequestStatus } from "../../../../clients/authentication/index.js";
import { getOptions, pickUnique } from "../../../../helpers.js";
import { PostConnection } from "../../../building-blocks/authentication/connections/index.js";
import { Approve, GetReceived, PostPackage } from "../../../building-blocks/authentication/request/index.js";
import { getClients, getEnduserOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

const JORDBRUK_PACKAGE = "urn:altinn:accesspackage:jordbruk";

const groupLabel = "0. Be om tilgang til jordbrukspakke";
const addAssignmentLabel = { step: "1. Virksomhet A grants Bruker B (assignment)" };
const requestPackageLabel = { step: "2. Bruker A requests jordbruk package" };
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

    // Bruker A (requester, owns Virksomhet A) and Bruker B (approver).
    const [a, b] = pickUnique(data, 2);

    group(groupLabel, function () {
        // Step 1: Virksomhet A grants Bruker B an assignment, so B can act for the
        // organization. Issued with A's token (A is daglig leder of Virksomhet A).
        // A person is added via the body (personidentifier + lastName), not the `to` query.
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a.pid, a.partyUuid));
        PostConnection(
            connectionsApiClient,
            { party: a.orgUuid, from: a.orgUuid },
            { personidentifier: b.pid, lastName: b.lastName },
            addAssignmentLabel,
        );

        // Step 2: Bruker A requests the jordbruk package, directed to Virksomhet A (A's token).
        const request = PostPackage(
            requestApiClient,
            a.partyUuid,
            a.orgUuid,
            JORDBRUK_PACKAGE,
            requestPackageLabel,
        );

        // Step 3: Bruker B fetches the received request for Virksomhet A and approves it (B's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        const received = GetReceived(
            requestApiClient,
            new ReceivedRequestsParamsBuilder()
                .withParty(a.orgUuid)
                .withStatus(RequestStatus.Pending)
                .build(),
            getReceivedLabel,
        );

        const requestId = received.data.find((r) => r.id === request.id)?.id ?? request.id;

        Approve(
            requestApiClient,
            { party: a.orgUuid, id: requestId },
            [],
            approveLabel,
        );
    });
}
