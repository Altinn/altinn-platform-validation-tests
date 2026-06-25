import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file testcase_8_add_frivillig_mva.js
 * @description Verifies that adding FMVA (Frivillig MVA-registrering) in ER is correctly
 * synced to Altinn Register.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-8-add-frivillig-mva": { executor: "shared-iterations", exec: "addFmva", vus: 1, iterations: 1 },
    },
};

const STYRELEDER = { fnr: "02895823468", fornavn: "Anne", slektsnavn: "Testperson" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00223" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>FMVA ADD TEST AS</navn1>
                    <rednavn>FMVA ADD TEST AS</rednavn>
                </infotype>
                <infotype felttype="FADR" endringstype="N">
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
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function addFmva() {
    const orgNr = generateOrgNr();
    console.log(`[TC8] orgNr: ${orgNr} | STYRELEDER: ${STYRELEDER.fnr} (${STYRELEDER.fornavn} ${STYRELEDER.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00317" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="NY" foersteOverfoering="N" datoFoedt="20260101" datoSistEndret="20260201">
                <infotype felttype="FMVA" endringstype="N">
                    <opplysning>OFVA</opplysning>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    runErSyncTestcase(
        "8. Add frivillig MVA (FMVA)",
        prep,
        change,
        orgNr,
        { "org is accessible in Register after FMVA added": (p) => p.organizationIdentifier === orgNr },
    );

    group("Cleanup", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, buildCleanupXml(orgNr), "Cleanup");
    });
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";

function buildCleanupXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00403" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
