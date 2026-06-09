import { group, check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope, createAuthorizedPartiesClient, retryUntilHasAccess, retryUntilNoAccess } from "./helper.js";

/**
 * @file testcase_4_replace_daglig_leder.js
 * @description Verifies that a change to DAGL (Daglig leder) in ER is correctly
 * synced to Altinn Register and reflected in authorized parties.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-4-replace-daglig-leder": { executor: "shared-iterations", exec: "daglChange", vus: 1, iterations: 1 },
    },
};

const OLD_DAGLIG_LEDER = { fnr: "20875798538", fornavn: "TALEFØR", slektsnavn: "HAKE" };
const NEW_DAGLIG_LEDER = { fnr: "26858396815", fornavn: "FLYKTIG", slektsnavn: "GASSPEDAL" };
const STYRELEDER = { fnr: "02895823468", fornavn: "Anne", slektsnavn: "Testperson" };
const STYREMEDLEM = { fnr: "07855812899", fornavn: "Ola Test", slektsnavn: "Testperson" };


function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00214" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>DAGL CHANGE TEST AS</navn1>
                    <rednavn>DAGL CHANGE TEST AS</rednavn>
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
                <samendringer data="D" felttype="LEDE" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${STYRELEDER.fornavn}</fornavn>
                    <slektsnavn>${STYRELEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
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
                    <rolleFoedselsnr>${OLD_DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${OLD_DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${OLD_DAGLIG_LEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 14</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function daglChange() {
    const orgNr = generateOrgNr();
    console.log(`[TC4] orgNr: ${orgNr} | OLD_DAGL: ${OLD_DAGLIG_LEDER.fnr} (${OLD_DAGLIG_LEDER.fornavn} ${OLD_DAGLIG_LEDER.slektsnavn}) | NEW_DAGL: ${NEW_DAGLIG_LEDER.fnr} (${NEW_DAGLIG_LEDER.fornavn} ${NEW_DAGLIG_LEDER.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00310" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="NY" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${OLD_DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${NEW_DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${NEW_DAGLIG_LEDER.slektsnavn}</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const apClient = createAuthorizedPartiesClient();

    // Phase 1: Prep - submit org with OLD_DAGL and wait for Register
    runErSyncTestcase(
        "4. Replace daglig leder (DAGL) - Prep",
        prep,
        change,
        orgNr,
        {},
        { stopAfterPrep: true },
    );

    // Phase 2: Confirm OLD_DAGL has access before testing replacement
    group("Verify - old DAGL has access to org after prep", () => {
        retryUntilHasAccess(apClient, OLD_DAGLIG_LEDER.fnr, orgNr, "4. Replace daglig leder - old DAGL access granted");
    });

    // Phase 3: Submit the DAGL replacement
    group("Change - submit DAGL replacement", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, change, "Change");
    });

    // Phase 4: Verify new DAGL has access
    group("Verify - new DAGL has access to org", () => {
        const parties = retryUntilHasAccess(apClient, NEW_DAGLIG_LEDER.fnr, orgNr, "replace-daglig-leder - new DAGL access");
        check(parties, {
            [`new DAGL (${NEW_DAGLIG_LEDER.fornavn} ${NEW_DAGLIG_LEDER.slektsnavn}) has access to org`]: (p) =>
                Array.isArray(p) && p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });

    // Phase 5: Verify old DAGL no longer has access
    group("Verify - old DAGL no longer has access to org", () => {
        const parties = retryUntilNoAccess(apClient, OLD_DAGLIG_LEDER.fnr, orgNr, "replace-daglig-leder - old DAGL access revoked");
        check(parties, {
            [`old DAGL (${OLD_DAGLIG_LEDER.fornavn} ${OLD_DAGLIG_LEDER.slektsnavn}) no longer has access to org`]: (p) =>
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
            <head avsender="ER" dato="20260512" kjoerenr="00406" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${NEW_DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
