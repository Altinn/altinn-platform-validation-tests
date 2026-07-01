/**
 * Be om tilgang-flyt.
 *
 * Per iterasjon plukkes to unike brukere og én tilfeldig tilgangspakke:
 *   - Bruker A: ber om tilgangspakken.
 *   - Bruker B: daglig leder av Virksomhet B; mottar og godkjenner forespørselen.
 *   - Tilgangspakken plukkes tilfeldig fra metadata-API-et (se common-functions.js).
 *
 * Steg:
 *   1. (Forutsetning) Virksomhet B legger til Bruker A som connection (assignment),
 *      slik at det finnes en relasjon før A kan be om tilgang. Krever: pid + etternavn
 *   2. Bruker A ber om tilgangspakken, rettet til Virksomhet B
 *   3. Bruker B lister sine mottatte forespørsler og finner den siste opprettede
 *   4. Bruker B godkjenner forespørselen på vegne av Virksomhet B
 *
 * Alle kall bruker personlige enduser-tokens (Altinn); den aktive brukerens token
 * byttes mellom stegene via den delte token-generatoren.
 *
 * Testdata er tilfeldige utvalgte brukere i Tenor med tilhørende tilgangsstyrer
 */

import { check, group } from "k6";

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

    // Bruker A (ber om tilgang) og Bruker B (daglig leder av Virksomhet B, godkjenner).
    const [a, b] = pickUnique(data.users, 2);
    const accessPackage = getItemFromList(data.packages, true);

    // Logg brukere/pakke slik at en feilende iterasjon kan feilsøkes manuelt.
    console.log(
        `A(pid=${a.pid}) -> B(pid=${b.pid}, orgNo=${b.orgNo}), pakke=${accessPackage}`,
    );

    group(groupLabel, function () {
        // Steg 1: Virksomhet B legger til Bruker A som connection (Bs token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        PostConnection(
            connectionsApiClient,
            { party: b.orgUuid, from: b.orgUuid },
            { personidentifier: a.pid, lastName: a.lastName },
            addAssignmentLabel,
        );

        // Steg 2: Bruker A ber om tilgangspakken for Virksomhet B (As token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a.pid, a.partyUuid));
        const request = PostPackage(
            requestApiClient,
            a.partyUuid,
            b.orgUuid,
            accessPackage,
            requestPackageLabel,
        );

        // Steg 3: Bruker B lister mottatte forespørsler og godkjenner den nye
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        const received = GetReceived(
            requestApiClient,
            new ReceivedRequestsParamsBuilder()
                .withParty(b.orgUuid)
                .withStatus(RequestStatus.Pending)
                .build(),
            getReceivedLabel,
        );

        // Verifiser at forespørselen fra steg 2 faktisk er blant de mottatte.
        const receivedRequest = received.data.find((r) => r.id === request.id);
        check(receivedRequest, {
            "Received contains the created request": (r) => r !== undefined,
        });

        // Steg 4: Bruker B godkjenner forespørselen på vegne av Virksomhet B.
        // Tom body ([]) godkjenner hele pakkeforespørselen; body-en brukes bare til godkjenning av enkeltrettigheter
        Approve(
            requestApiClient,
            b.orgUuid,
            receivedRequest.id,
            [],
            approveLabel,
        );
    });
}
