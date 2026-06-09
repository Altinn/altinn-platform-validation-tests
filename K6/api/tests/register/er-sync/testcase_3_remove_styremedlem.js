import { group, check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope, createAuthorizedPartiesClient, retryUntilHasAccess, retryUntilNoAccess } from "./helper.js";

/**
 * @file testcase_3_remove_styremedlem.js
 * @description Verifies that removing a MEDL (Styremedlem) in ER is correctly
 * synced to Altinn Register and reflected in authorized parties.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-3-remove-styremedlem": { executor: "shared-iterations", exec: "removeMedl", vus: 1, iterations: 1 },
    },
};

const DAGLIG_LEDER = { fnr: "26827896992", fornavn: "VIKTIG", slektsnavn: "ORIDÉ" };
const STYREMEDLEM = { fnr: "10921148513", fornavn: "UKLAR", slektsnavn: "PLAST" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00250" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>REMOVE MEDL TEST AS</navn1>
                    <rednavn>REMOVE MEDL TEST AS</rednavn>
                </infotype>
                <infotype felttype="FADR" endringstype="N">
                    <postnr>0150</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Testveien 10</adresse1>
                </infotype>
                <infotype felttype="PADR" endringstype="N">
                    <postnr>0150</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Testveien 10</adresse1>
                </infotype>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${DAGLIG_LEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 14</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function removeMedl() {
    const orgNr = generateOrgNr();
    console.log(`[TC3] orgNr: ${orgNr} | DAGLIG_LEDER: ${DAGLIG_LEDER.fnr} (${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn}) | STYREMEDLEM: ${STYREMEDLEM.fnr} (${STYREMEDLEM.fornavn} ${STYREMEDLEM.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00340" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const apClient = createAuthorizedPartiesClient();

    // Phase 1: Prep - submit org with MEDL+DAGL and wait for Register
    runErSyncTestcase(
        "3. Remove styremedlem (MEDL) - Prep",
        prep,
        change,
        orgNr,
        {},
        { stopAfterPrep: true },
    );

    // Phase 2: Confirm MEDL actually has access before testing removal
    group("Verify - MEDL has access to org after prep", () => {
        retryUntilHasAccess(apClient, STYREMEDLEM.fnr, orgNr, "3. Remove styremedlem - MEDL access granted");
    });

    // Phase 3: Submit the MEDL removal
    group("Change - submit MEDL removal", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, change, "Change");
    });

    // Phase 4: Poll until MEDL no longer appears in authorized parties
    group("Verify - MEDL no longer has access to org", () => {
        const parties = retryUntilNoAccess(apClient, STYREMEDLEM.fnr, orgNr, "3. Remove styremedlem - MEDL access revoked");
        check(parties, {
            [`MEDL (${STYREMEDLEM.fornavn} ${STYREMEDLEM.slektsnavn}) no longer has access to org`]: (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });

    group("Cleanup", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, buildCleanupXml(orgNr), "Cleanup");
    });
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";

function buildCleanupXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00411" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
