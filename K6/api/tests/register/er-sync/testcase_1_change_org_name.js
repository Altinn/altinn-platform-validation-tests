import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file testcase_1_change_org_name.js
 * @description Verifies that a change to NAVN (short name) in ER is correctly
 * synced to Altinn Register.
 *
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-1-change-org-name": { executor: "shared-iterations", exec: "nameShortChange", vus: 1, iterations: 1 },
    },
};

const INNEHAVER = { fnr: "12864421537", fornavn: "Elise", slektsnavn: "Testperson" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00201" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="ENK" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20210101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>NAVN CHANGE TEST ENK</navn1>
                    <rednavn>NAVN CHANGE TEST ENK</rednavn>
                </infotype>
                <infotype felttype="FADR" endringstype="N">
                    <postnr>1234</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Testveien 1</adresse1>
                </infotype>
                <samendringer data="D" felttype="INNH" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${INNEHAVER.fnr}</rolleFoedselsnr>
                    <fornavn>${INNEHAVER.fornavn}</fornavn>
                    <slektsnavn>${INNEHAVER.slektsnavn}</slektsnavn>
                    <postnr>1234</postnr>
                    <adresse1>Testveien 29</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function nameShortChange() {
    const orgNr = generateOrgNr();
    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00301" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="ENK" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20210101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>NAVN CHANGE TEST ENK OPPDATERT</navn1>
                    <rednavn>NAVN CHANGE TEST ENK OPPDATERT</rednavn>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    runErSyncTestcase(
        "1. Change org name",
        prep,
        change,
        orgNr,
        { "org name updated to NAVN CHANGE TEST ENK OPPDATERT": (p) => p.displayName === "NAVN CHANGE TEST ENK OPPDATERT" },
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
            <head avsender="ER" dato="20260512" kjoerenr="00402" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="ENK" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20210101" datoSistEndret="20260512">
                <samendringer data="D" felttype="INNH" endringstype="U" type="R">
                    <rolleFoedselsnr>${INNEHAVER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
