import { expect, Page } from "@playwright/test";
import { randomUUID } from "crypto";

import { ApiClient } from "../clients";
import { CorrespondenceDetails, InitializedCorrespondences } from "../clients/correspondence";
import { TestUser } from "../config/environment";
import { aktivAktorUuid, brukerIder } from "./sesjonsdata";

/** En melding en test har sendt. Tittelen er unik, så meldingen kan kjennes igjen i innboksen. */
export type Melding = { id: string; tittel: string; tekst: string };

// Meldingstjenesten og avsenderen K6-testene bruker i at23 og tt02, se K6/api/tests/correspondence/commons.js.
const RESSURS = "bruno-correspondence";
const AVSENDER = { org: "digdir", orgNo: "991825827" };

function tjenesteeierToken(api: ApiClient, miljo: string): Promise<string> {
    return api.tokenGenerator.GetEnterpriseToken({
        env: miljo,
        scopes: "altinn:correspondence.write altinn:serviceowner",
        ...AVSENDER,
    });
}

/** Sender en melding fra tjenesteeieren til `mottaker`, som må bekreftes etter at den er lest. */
export async function sendMelding(api: ApiClient, miljo: string, mottaker: TestUser): Promise<Melding> {
    const referanse = randomUUID();
    const melding = {
        tittel: `Bruksmønster D ${referanse.slice(0, 8)}`,
        tekst: "Meldingen er sendt av en automatisk test og kan slettes.",
    };

    const response = await api.correspondence.InitializeCorrespondence(await tjenesteeierToken(api, miljo), {
        correspondence: {
            resourceId: RESSURS,
            sendersReference: referanse,
            content: {
                language: "nb",
                messageTitle: melding.tittel,
                messageSummary: "Testmelding fra Playwright",
                messageBody: melding.tekst,
                attachments: [],
            },
            isConfirmationNeeded: true,
            dueDateTime: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
            ignoreReservation: true,
        },
        recipients: [mottaker.pid],
    });
    expect(response.ok(), `Sending av melding til ${mottaker.name}: ${response.status()} ${await response.text()}`).toBe(true);

    const { correspondences }: InitializedCorrespondences = await response.json();
    return { id: correspondences[0].correspondenceId, ...melding };
}

/** Statusene meldingen har vært gjennom, som tjenesteeieren ser dem: Published, Read, Confirmed og så videre. */
export async function meldingsstatuser(api: ApiClient, miljo: string, { id }: Melding): Promise<string[]> {
    const response = await api.correspondence.GetCorrespondenceDetails(await tjenesteeierToken(api, miljo), id);
    expect(response.ok(), `Henting av melding ${id}: ${response.status()}`).toBe(true);
    const detaljer: CorrespondenceDetails = await response.json();
    return detaljer.statusHistory.map(({ status }) => status);
}

/**
 * Sletter meldingen for godt, som mottakeren som er logget inn på `page`. Tjenesteeieren kan
 * ikke slette en melding som er publisert, og mottakeren først når den er bekreftet.
 */
export async function slettMelding(api: ApiClient, page: Page, miljo: string, mottaker: TestUser, { id }: Melding) {
    const token = await api.tokenGenerator.GetPersonalToken({
        env: miljo,
        scopes: "altinn:correspondence.write",
        pid: mottaker.pid,
        ...(await brukerIder(page)),
        partyuuid: await aktivAktorUuid(page),
    });
    const response = await api.correspondence.PurgeCorrespondence(token, id);
    expect(response.ok(), `Sletting av melding ${id}: ${response.status()} ${await response.text()}`).toBe(true);
}
