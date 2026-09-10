/**
 * Be om tilgang-flyt.
 *
 * Per iterasjon plukkes to unike brukere og én tilfeldig tilgangspakke:
 * - Bruker A: ber om tilgangspakken.
 * - Bruker B: daglig leder av Virksomhet B; mottar og godkjenner forespørselen.
 * - Tilgangspakken plukkes tilfeldig fra metadata-API-et (se common-functions.js).
 *
 * Steg:
 * 1. (Forutsetning) Virksomhet B legger til Bruker A som connection (assignment),
 * slik at det finnes en relasjon før A kan be om tilgang. Krever: pid + etternavn
 * 2. Bruker A ber om tilgangspakken, rettet til Virksomhet B
 * 3. Bruker B lister sine mottatte forespørsler og finner den siste opprettede
 * 4. Bruker B godkjenner forespørselen på vegne av Virksomhet B
 * 5. (Opprydding) Virksomhet B fjerner connectionen igjen, med cascade, slik at
 * tilgangspakken godkjenningen ga forsvinner med den.
 *
 * Uten steg 5 hoper tilgangene seg opp: hver iterasjon legger én pakke til på
 * connectionen og fjerner ingen, så etter noen tusen kjøringer har brukerne
 * nesten alle pakkene på nesten alle virksomhetene. Da beviser ikke steg 4
 * lenger at en ny tilgang blir gitt, den gir bare på nytt det som alt ligger der.
 *
 * Alle kall bruker personlige enduser-tokens (Altinn); den aktive brukerens token
 * byttes mellom stegene via den delte token-generatoren.
 *
 * Testdata er tilfeldige utvalgte brukere i Tenor med tilhørende tilgangsstyrer
 */

import { check, fail, group } from "k6";

import { CreateConnectionQueryBuilder, DeleteConnectionQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { ReceivedRequestsQueryBuilder, RequestStatus } from "../../../../../clients/access-management/enduser/request/index.js";
import { getItemFromList, getOptions, pickUnique } from "../../../../../helpers.js";
import { CreateConnection, DeleteConnection } from "../../../../building-blocks/access-management/enduser/connections/index.js";
import { ApproveReceivedRequest, CreatePackageRequest, GetReceivedRequests } from "../../../../building-blocks/access-management/enduser/request/index.js";
import { getClients, getEnduserOpts } from "./common-functions.js";

export { setup } from "./common-functions.js";

const groupLabel = "0. Be om tilgang til tilgangspakke";
const addAssignmentLabel = { step: "1. Virksomhet B adds Bruker A (assignment)" };
const requestPackageLabel = { step: "2. Bruker A requests access package" };
const getReceivedLabel = { step: "3. Bruker B gets received request" };
const approveLabel = { step: "4. Bruker B approves request" };
const cleanupLabel = { step: "5. Virksomhet B removes the connection" };

export const options = getOptions([
    addAssignmentLabel,
    requestPackageLabel,
    getReceivedLabel,
    approveLabel,
    cleanupLabel,
]);

/**
 * @param {ReturnType<typeof import("./common-functions.js").setup>} data Test data from setup.
 */
export default function (data) {
    const [connectionsApiClient, requestApiClient, tokenGenerator] = getClients();

    // Bruker A (ber om tilgang) og Bruker B (daglig leder av Virksomhet B, godkjenner).
    const [a, b] = pickUnique(data.users, 2);
    const accessPackage = getItemFromList(data.packages, true);

    group(groupLabel, function () {
        // Steg 1: Virksomhet B legger til Bruker A som connection (Bs token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        CreateConnection(
            connectionsApiClient,
            new CreateConnectionQueryBuilder()
                .withParty(b.orgUuid)
                .build(),
            { personIdentifier: a.pid, lastName: a.lastName },
            addAssignmentLabel,
        );

        // Steg 2: Bruker A ber om tilgangspakken for Virksomhet B (As token).
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(a.pid, a.partyUuid));
        const request = CreatePackageRequest(
            requestApiClient,
            a.partyUuid,
            b.orgUuid,
            accessPackage,
            requestPackageLabel,
        );

        // Steg 3: Bruker B lister mottatte forespørsler og godkjenner den nye
        tokenGenerator.setTokenGeneratorOptions(getEnduserOpts(b.pid, b.partyUuid));
        const received = GetReceivedRequests(
            requestApiClient,
            new ReceivedRequestsQueryBuilder()
                .withParty(b.orgUuid)
                .withStatus([RequestStatus.Pending])
                .build(),
            null,
            null,
            getReceivedLabel,
        );

        // Verifiser at forespørselen fra steg 2 faktisk er blant de mottatte.
        const receivedRequest = received.find((r) => r.id === request?.id);
        const wasReceived = check(receivedRequest, {
            "Received contains the created request": (r) => r !== undefined,
        });

        if (!wasReceived || receivedRequest === undefined) {
            fail("kan ikke godkjenne: forespørselen fra steg 2 er ikke blant de mottatte");
        }

        // Steg 4: Bruker B godkjenner forespørselen på vegne av Virksomhet B.
        // Tom body ([]) godkjenner hele pakkeforespørselen; body-en brukes bare til godkjenning av enkeltrettigheter
        ApproveReceivedRequest(
            requestApiClient,
            b.orgUuid,
            receivedRequest.id,
            [],
            approveLabel,
        );

        // Steg 5: Fjern connectionen igjen (Bs token). Cascade tar tilgangspakken
        // godkjenningen ga med seg, så iterasjonen etterlater ingen tilgang.
        DeleteConnection(
            connectionsApiClient,
            new DeleteConnectionQueryBuilder()
                .withParty(b.orgUuid)
                .withFrom(b.orgUuid)
                .withTo(a.partyUuid)
                .withCascade(true)
                .build(),
            cleanupLabel,
        );
    });
}
