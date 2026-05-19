import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file testcase_6_change_forretningsadresse.js
 * @description Verifies that a change to FADR (Forretningsadresse) in ER is correctly
 * synced to Altinn Register.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-6-change-forretningsadresse": { executor: "shared-iterations", exec: "fadrChange", vus: 1, iterations: 1 },
    },
};

const STYRELEDER = { fnr: "02831899053", fornavn: "LILLA", slektsnavn: "NETTADRESSE" };
const STYREMEDLEM = { fnr: "03823648714", fornavn: "SEIN", slektsnavn: "ELV" };
const STYREMEDLEM2 = { fnr: "26812099719", fornavn: "STOR", slektsnavn: "KAPPE" };
const DAGLIG_LEDER = { fnr: "05830299450", fornavn: "SPENNENDE", slektsnavn: "BRØKSTREK" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00210" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>FADR CHANGE TEST AS</navn1>
                    <rednavn>FADR CHANGE TEST AS</rednavn>
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
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>2</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM2.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM2.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM2.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 13</adresse1>
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

export function fadrChange() {
    const orgNr = generateOrgNr();
    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00306" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="FADR" endringstype="N">
                    <postnr>0350</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Ny Forretningsgate 5</adresse1>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    runErSyncTestcase(
        "6. Change forretningsadresse (FADR)",
        prep,
        change,
        orgNr,
        {
            "org businessAddress updated to Ny Forretningsgate 5": (p) => p.businessAddress?.address === "Ny Forretningsgate 5",
            "org businessAddress postalCode updated to 0350": (p) => p.businessAddress?.postalCode === "0350",
        },
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
            <head avsender="ER" dato="20260512" kjoerenr="00404" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM2.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
