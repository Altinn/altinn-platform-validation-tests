import { getEnterpriseToken, getPersonalToken } from "./token-generator";

/**
 * Portert fra K6/clients/dialogporten/serviceowner/serviceowner.js og
 * request-body-templates.js, og verifisert direkte mot AT23: samme kall som
 * K6 sitt instance-delegation-oppsett bruker for å lage en instans å delegere
 * på (se K6/api/tests/access-management-bff/instance-delegation/org-to-user.js).
 *
 * Tjenesteeieren er ttd/digdir (samme SERVICE_OWNER_ORG_NO som k6-testene),
 * og trenger bare et enterprise-token på digdir:dialogporten.serviceprovider
 * fra testverktøyet, ikke en ekte Maskinporten-signert grant.
 */
export const SERVICE_OWNER_ORG_NO = "991825827";
const SERVICE_OWNER_ORG = "ttd";
const DIALOGPORTEN_SCOPE = "digdir:dialogporten.serviceprovider";

async function serviceOwnerToken(miljo: string): Promise<string> {
    return getEnterpriseToken({
        env: miljo,
        scopes: DIALOGPORTEN_SCOPE,
        org: SERVICE_OWNER_ORG,
        orgNo: SERVICE_OWNER_ORG_NO,
    });
}

function party(partyId: string): string {
    return partyId.length === 11
        ? `urn:altinn:person:identifier-no:${partyId}`
        : `urn:altinn:organization:identifier-no:${partyId}`;
}

/**
 * Oppretter en dialog for en virksomhet, uten transmisjoner eller aktiviteter
 * siden testen bare trenger at dialogen finnes og vises i innboksen.
 *
 * @param platformUrl `urler.platform` fra miljøets project i playwright.config.ts.
 * @param miljo Miljønavnet testverktøyets token-generator skal utstede tokenet for, f.eks. "at23".
 * @param orgNo Virksomheten dialogen skal ligge hos (Business A).
 * @param resourceId Ressursen dialogen gjelder (Resource R).
 * @param title Tittelen som vises i innboksen, til å kjenne igjen dialogen på.
 * @returns Dialog-IDen, til bruk i `deleteDialog` og i PDP-spørringer.
 */
export async function createDialog(platformUrl: string, miljo: string, orgNo: string, resourceId: string, title: string): Promise<string> {
    const token = await serviceOwnerToken(miljo);

    const response = await fetch(`${platformUrl}/dialogporten/api/v1/serviceowner/dialogs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            serviceResource: `urn:altinn:resource:${resourceId}`,
            party: party(orgNo),
            status: "notApplicable",
            dueAt: "2033-11-25T06:37:54.2920190Z",
            expiresAt: "2053-11-25T06:37:54.2920190Z",
            process: "urn:test:process:1",
            content: {
                title: { value: [{ languageCode: "nb", value: title }] },
                summary: { value: [{ languageCode: "nb", value: "Opprettet av Playwright-testen for Brukermønster test-H" }] },
            },
            transmissions: [],
            activities: [],
        }),
    });

    if (response.status !== 201) {
        throw new Error(`Klarte ikke å opprette dialog: ${response.status} ${await response.text()}`);
    }

    return (await response.json()) as string;
}

/**
 * Fjerner dialogen igjen. Kalles i opprydding uansett om testen lyktes, så en
 * feilet kjøring ikke lar en testdialog ligge igjen i virksomhetens innboks.
 *
 * Sletter først (myk sletting) og renser deretter permanent, som er det
 * dialogporten-API-et krever for en fullstendig opprydding.
 */
export async function deleteDialog(platformUrl: string, miljo: string, dialogId: string): Promise<void> {
    const token = await serviceOwnerToken(miljo);
    const dialogUrl = `${platformUrl}/dialogporten/api/v1/serviceowner/dialogs/${dialogId}`;

    await fetch(dialogUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    await fetch(`${dialogUrl}/actions/purge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

/**
 * Spør Dialogportens egen enduser-API (`GET .../enduser/dialogs`) direkte,
 * som den innloggede personen selv, om virksomhetens dialog på den gitte
 * ressursen er søkbar for dem ennå.
 *
 * Portert fra K6/clients/dialogporten/enduser/enduser.js
 * (`EnduserApiClient.GetDialogs`) og K6/api/tests/dialogporten/enduser/
 * common-functions.js (samme scope, "digdir:dialogporten", og samme
 * token-oppsett med personens pid som k6-testene bruker).
 *
 * Brukes som en mer presis, API-basert bekreftelse av at dialogen faktisk er
 * synlig for mottakeren — til forskjell fra den generiske PDP-sjekken
 * (`authorize` i `config/pdp.ts`), som bare bekrefter tilgang på ressursen,
 * ikke at selve dialogen er dukket opp. Tenkt som fallback når den
 * GUI-baserte innboks-sjekken (aktørbytteren) ikke rekker å vise dette innen
 * sin egen tidsfrist — se bruken i
 * `tests/tilgangsstyring/dagl-delegerer-tilgangspakke-til-person.spec.ts`.
 *
 * Går rett mot Dialogporten, ikke via arbeidsflatens BFF
 * (`af.{miljo}.altinn.cloud/api/graphql`) — bekreftet empirisk at BFF-et
 * avviser et rent personlig token uten nettleserens sesjonscookies
 * ("401 Unauthorized: No token found"), mens dette endepunktet godtar et
 * vanlig personlig token akkurat som skygge-dialog-API-et over gjør for
 * tjenesteeiere.
 *
 * @param platformUrl `urler.platform` fra miljøets project i playwright.config.ts.
 * @param miljo Miljønavnet testverktøyets token-generator skal utstede tokenet for, f.eks. "at23".
 * @param personPid Personen (mottakeren) sitt fødselsnummer.
 * @param orgNo Virksomheten dialogen ligger hos (Business A).
 * @param resourceId Ressursen dialogen gjelder (Resource R).
 * @returns Om minst én dialog på denne virksomheten/ressursen er søkbar for personen akkurat nå.
 */
export async function erDialogSynligForPerson(platformUrl: string, miljo: string, personPid: string, orgNo: string, resourceId: string): Promise<boolean> {
    const token = await getPersonalToken({ env: miljo, scopes: "digdir:dialogporten", pid: personPid });

    const url = new URL(`${platformUrl}/dialogporten/api/v1/enduser/dialogs`);
    url.searchParams.append("party", party(orgNo));
    url.searchParams.append("serviceResource", `urn:altinn:resource:${resourceId}`);

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error(`Klarte ikke å søke etter dialoger: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as { items?: unknown[] };
    return (body.items?.length ?? 0) > 0;
}
