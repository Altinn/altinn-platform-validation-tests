import { group, check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope, createAuthorizedPartiesClient, retryUntilHasAccess, retryUntilNoAccess } from "./helper.js";

/**
 * @file testcase_10_delete_org.js
 * @description Verifies that deleting an organization (hovedsakstype="S") in ER
 * is correctly synced to Altinn Register and revokes access for existing role holders.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-10-delete-org": { executor: "shared-iterations", exec: "deleteOrg", vus: 1, iterations: 1 },
    },
};

const DAGLIG_LEDER = { fnr: "22876298973", fornavn: "OFFISIELL", slektsnavn: "ÆRESDOKTOR" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00150" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>SLETT ORG TEST AS</navn1>
                    <rednavn>SLETT ORG TEST AS</rednavn>
                </infotype>
                <infotype felttype="FADR" endringstype="N">
                    <postnr>0150</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Testveien 1</adresse1>
                </infotype>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${DAGLIG_LEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 10</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function deleteOrg() {
    const orgNr = generateOrgNr();
    console.log(`[TC10] orgNr: ${orgNr} | DAGLIG_LEDER: ${DAGLIG_LEDER.fnr} (${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00250" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="S" undersakstype="SL" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const apClient = createAuthorizedPartiesClient();

    // Phase 1: Prep - register org with DAGL and wait for Register
    runErSyncTestcase(
        "10. Slett org - Prep",
        prep,
        change,
        orgNr,
        {},
        { stopAfterPrep: true },
    );

    // Phase 2: Confirm DAGL has access before testing deletion
    group("Verify - DAGL has access to org after prep", () => {
        const parties = retryUntilHasAccess(apClient, DAGLIG_LEDER.fnr, orgNr, "10. Slett org - DAGL access granted");
        console.log(`[TC10] Authorized parties for ${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn} after prep: ${JSON.stringify(parties)}`);
    });

    // Phase 3: Submit org deletion
    group("Change - submit org deletion", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, change, "Change");
    });

    // Phase 4: Verify DAGL no longer has access after org deletion
    group("Verify - DAGL no longer has access after org deletion", () => {
        const parties = retryUntilNoAccess(apClient, DAGLIG_LEDER.fnr, orgNr, "10. Slett org - DAGL access revoked");
        console.log(`[TC10] Authorized parties for ${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn} after deletion: ${JSON.stringify(parties)}`);
        check(parties, {
            [`${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn} no longer has access to deleted org`]: (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";
