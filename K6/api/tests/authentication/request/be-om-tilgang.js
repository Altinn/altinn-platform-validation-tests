/**
 * Be om tilgang (request access) flow.
 *
 * The Jordbruk access package can only be assigned in an organization context
 * (not to/from a person), so the request is directed to Bruker B's organization,
 * which B approves on behalf of as its daglig leder.
 *
 * Two unique users are picked per iteration:
 *   - Bruker A: requests an access package.
 *   - Bruker B: daglig leder of Virksomhet B; receives and approves the request.
 *
 * Steps:
 *   1. (Prerequisite) Virksomhet B adds Bruker A as a connection (assignment), so
 *      a relationship exists before A can request access. Issued with B's token
 *      (B is daglig leder of Virksomhet B).
 *   2. Bruker A requests the Jordbruk access package, directed to Virksomhet B.
 *   3. Bruker B lists the received request and approves it on behalf of
 *      Virksomhet B (party = b.orgUuid). B is daglig leder, so this is a plain
 *      enduser request — no extra authorization needed.
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
const addAssignmentLabel = { step: "1. Virksomhet B adds Bruker A (assignment)" };
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

    // Bruker A (requester) and Bruker B (daglig leder of Virksomhet B, the approver).
    const [a, b] = pickUnique(data, 2);

    group(groupLabel, function () {
        // Step 1: Virksomhet B adds Bruker A as a connection, so a relationship
        // exists before A requests access. Issued with B's token (B is daglig leder
        // of Virksomhet B). A person is added via the body (personidentifier +
        // lastName), not the `to` query.
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        PostConnection(
            connectionsApiClient,
            { party: b.orgUuid, from: b.orgUuid },
            { personidentifier: a.pid, lastName: a.lastName },
            addAssignmentLabel,
        );

        // Step 2: Bruker A requests the jordbruk package, directed to Virksomhet B (A's token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a.pid, a.partyUuid));
        const request = PostPackage(
            requestApiClient,
            a.partyUuid,
            b.orgUuid,
            JORDBRUK_PACKAGE,
            requestPackageLabel,
        );

        // Step 3: Bruker B lists the received request and approves it on behalf of
        // Virksomhet B (party = b.orgUuid). B is daglig leder (B's token).
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
