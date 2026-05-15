import { group } from "k6";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file add-fmva.js
 * @description Verifies that adding FMVA (Frivillig MVA-registrering) in ER is correctly
 * synced to Altinn Register.
 *
 * k6 run add-fmva.js \
 *   -e ENVIRONMENT=at22 -e BASE_URL=https://platform.at22.altinn.cloud \
 *   -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> \
 *   -e REGISTER_SUBSCRIPTION_KEY=<key>
 *
 * @see README.md
 */

export const options = {
    scenarios: {
        "register-fmva": { executor: "shared-iterations", exec: "addFmva", vus: 1, iterations: 1 },
    },
};

const LEDE = { fnr: "02895823468", fornavn: "Anne", slektsnavn: "Testperson" };

function buildPrepXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
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
                    <rolleFoedselsnr>${LEDE.fnr}</rolleFoedselsnr>
                    <fornavn>${LEDE.fornavn}</fornavn>
                    <slektsnavn>${LEDE.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}

export function setup() {
    return { orgNr: generateOrgNr() };
}

export function addFmva({ orgNr = generateOrgNr() } = {}) {
    const prep = buildPrepXml(orgNr);

    const change = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00317" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="NY" foersteOverfoering="N" datoFoedt="20260101" datoSistEndret="20260201">
                <infotype felttype="FMVA" endringstype="N">
                    <opplysning>OFVA</opplysning>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runErSyncTestcase(
        "Register Frivillig MVA-registrering (FMVA)",
        prep,
        change,
        orgNr,
        { "org is accessible in Register after FMVA added": (p) => p.partyType === "organization" },
    );

    group("Cleanup", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, buildCleanupXml(orgNr), "Cleanup");
    });
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";

function buildCleanupXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00403" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${LEDE.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}
