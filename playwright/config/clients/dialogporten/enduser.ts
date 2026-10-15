import { getPersonalToken } from "../token-generator";
import { party, resource } from "./common";

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
 * (`authorize` i `config/clients/pdp.ts`), som bare bekrefter tilgang på
 * ressursen, ikke at selve dialogen er dukket opp. Tenkt som fallback når den
 * GUI-baserte innboks-sjekken (aktørbytteren) ikke rekker å vise dette innen
 * sin egen tidsfrist — se bruken i
 * `tests/tilgangsstyring/dagl-delegerer-tilgangspakke-til-person.spec.ts`.
 *
 * Går rett mot Dialogporten, ikke via arbeidsflatens BFF
 * (`af.{miljo}.altinn.cloud/api/graphql`) — bekreftet empirisk at BFF-et
 * avviser et rent personlig token uten nettleserens sesjonscookies
 * ("401 Unauthorized: No token found"), mens dette endepunktet godtar et
 * vanlig personlig token akkurat som skygge-dialog-API-et for tjenesteeiere
 * (`dialogporten/serviceowner.ts`) gjør.
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
    url.searchParams.append("serviceResource", resource(resourceId));

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error(`Klarte ikke å søke etter dialoger: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as { items?: unknown[] };
    return (body.items?.length ?? 0) > 0;
}
