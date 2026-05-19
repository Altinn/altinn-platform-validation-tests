import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file testcase_9_kaste_styret.js
 * @description Verifies that dismissing the entire board (samendringUtgaar SAMU/STYR) in ER
 * is correctly synced to Altinn Register.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-9-kaste-styret": { executor: "shared-iterations", exec: "kasteStyret", vus: 1, iterations: 1 },
    },
};

const STYRELEDER = { fnr: "11814997261", fornavn: "VRIEN", slektsnavn: "EKSPLOSJON" };
const NESTLEDER = { fnr: "08924998319", fornavn: "ØVRIGE", slektsnavn: "EGGEPLOMME" };
const STYREMEDLEM1 = { fnr: "28917699196", fornavn: "LANGFINGRET", slektsnavn: "BÅNDSALAT" };

const STYREMEDLEM2 = { fnr: "18914598245", fornavn: "UTÅLMODIG", slektsnavn: "MASKIN" };
const STYREMEDLEM3 = { fnr: "05830299450", fornavn: "SPENNENDE", slektsnavn: "BRØKSTREK" };
const STYREMEDLEM4 = { fnr: "26827896992", fornavn: "VIKTIG", slektsnavn: "ORIDÉ" };
const OBSERVATØR = { fnr: "28824198537", fornavn: "SNÅL", slektsnavn: "LERKE" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00260" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>KASTE STYRET TEST AS</navn1>
                    <rednavn>KASTE STYRET TEST AS</rednavn>
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
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM1.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM1.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM1.slektsnavn}</slektsnavn>
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
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>3</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM3.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM3.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM3.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 14</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>4</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM4.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM4.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM4.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 15</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="NEST" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${NESTLEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${NESTLEDER.fornavn}</fornavn>
                    <slektsnavn>${NESTLEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 16</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="OBS" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${OBSERVATØR.fnr}</rolleFoedselsnr>
                    <fornavn>${OBSERVATØR.fornavn}</fornavn>
                    <slektsnavn>${OBSERVATØR.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 17</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function kasteStyret() {
    const orgNr = generateOrgNr();
    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00350" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringUtgaar felttype="SAMU">
                    <samendringstype>STYR</samendringstype>
                </samendringUtgaar>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    runErSyncTestcase(
        "9. Kaste styret (SAMU/STYR)",
        prep,
        change,
        orgNr,
        { "org is accessible in Register after board is dismissed": (p) => p.partyType === "organization" },
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
            <head avsender="ER" dato="20260512" kjoerenr="00420" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM1.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM2.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM3.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM4.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="NEST" endringstype="U" type="R">
                    <rolleFoedselsnr>${NESTLEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="OBS" endringstype="U" type="R">
                    <rolleFoedselsnr>${OBSERVATØR.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
