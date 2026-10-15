import { getEnterpriseToken } from "../token-generator";
import { party, resource } from "./common";

/**
 * Portert fra K6/clients/dialogporten/serviceowner/serviceowner.js og
 * request-body-templates.js, og verifisert direkte mot AT23: samme kall som
 * K6 sitt instance-delegation-oppsett bruker for å lage en instans å delegere
 * på (se K6/api/tests/access-management-bff/instance-delegation/org-to-user.js).
 *
 * Standardverdiene under er ttd/digdir, samme tjenesteeier k6-testene bruker
 * — send inn andre verdier om en test trenger en annen tjenesteeier.
 */
export const DEFAULT_SERVICE_OWNER_ORG_NO = "991825827";
export const DEFAULT_SERVICE_OWNER_ORG = "ttd";
const DIALOGPORTEN_SCOPE = "digdir:dialogporten.serviceprovider";

type ServiceOwner = { org: string; orgNo: string };

async function serviceOwnerToken(miljo: string, serviceOwner: ServiceOwner): Promise<string> {
    return getEnterpriseToken({
        env: miljo,
        scopes: DIALOGPORTEN_SCOPE,
        org: serviceOwner.org,
        orgNo: serviceOwner.orgNo,
    });
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
 * @param serviceOwner Tjenesteeieren som oppretter dialogen. Standard: ttd/digdir.
 * @returns Dialog-IDen, til bruk i `deleteDialog` og i PDP-spørringer.
 */
export async function createDialog(
    platformUrl: string,
    miljo: string,
    orgNo: string,
    resourceId: string,
    title: string,
    serviceOwner: ServiceOwner = { org: DEFAULT_SERVICE_OWNER_ORG, orgNo: DEFAULT_SERVICE_OWNER_ORG_NO },
): Promise<string> {
    const token = await serviceOwnerToken(miljo, serviceOwner);

    const response = await fetch(`${platformUrl}/dialogporten/api/v1/serviceowner/dialogs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            serviceResource: resource(resourceId),
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
export async function deleteDialog(
    platformUrl: string,
    miljo: string,
    dialogId: string,
    serviceOwner: ServiceOwner = { org: DEFAULT_SERVICE_OWNER_ORG, orgNo: DEFAULT_SERVICE_OWNER_ORG_NO },
): Promise<void> {
    const token = await serviceOwnerToken(miljo, serviceOwner);
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
