import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file testcase_7_update_contact_info.js
 * @description Verifies that changes to contact information (TFON, TFAX, EPOS, IADR) in ER
 * are correctly synced to Altinn Register.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-7-update-contact-info": { executor: "shared-iterations", exec: "contactChange", vus: 1, iterations: 1 },
    },
};

const STYRELEDER = { fnr: "28824198537", fornavn: "SNÅL", slektsnavn: "LERKE" };
const DAGLIG_LEDER = { fnr: "57896202792", fornavn: "INTERESSERT", slektsnavn: "FANGE" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00229" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>CONTACT CHANGE TEST AS</navn1>
                    <rednavn>CONTACT CHANGE TEST AS</rednavn>
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
                <infotype felttype="TFON" endringstype="N">
                    <opplysning>22334455</opplysning>
                </infotype>
                <infotype felttype="TFAX" endringstype="N">
                    <opplysning>22334456</opplysning>
                </infotype>
                <infotype felttype="EPOS" endringstype="N">
                    <opplysning>contact-test@example.com</opplysning>
                </infotype>
                <infotype felttype="IADR" endringstype="N">
                    <opplysning>http://initial.example.com</opplysning>
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

export function contactChange() {
    const orgNr = generateOrgNr();
    console.log(`[TC7] orgNr: ${orgNr} | DAGLIG_LEDER: ${DAGLIG_LEDER.fnr} (${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00321" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="TFON" endringstype="N">
                    <opplysning>99887711</opplysning>
                </infotype>
                <infotype felttype="TFAX" endringstype="N">
                    <opplysning>99887712</opplysning>
                </infotype>
                <infotype felttype="EPOS" endringstype="N">
                    <opplysning>contact-test-oppdatert@example.com</opplysning>
                </infotype>
                <infotype felttype="IADR" endringstype="N">
                    <opplysning>http://oppdatert.example.com</opplysning>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    runErSyncTestcase(
        "7. Update contact info",
        prep,
        change,
        orgNr,
        {
            "org telephoneNumber updated to 99887711": (p) => p.telephoneNumber === "99887711",
            "org faxNumber updated to 99887712": (p) => p.faxNumber === "99887712",
            "org emailAddress updated to contact-test-oppdatert@example.com": (p) => p.emailAddress === "contact-test-oppdatert@example.com",
            "org internetAddress updated to http://oppdatert.example.com": (p) => p.internetAddress === "http://oppdatert.example.com",
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
            <head avsender="ER" dato="20260512" kjoerenr="00405" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
