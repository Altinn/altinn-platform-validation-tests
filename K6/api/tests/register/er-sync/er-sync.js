import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";

/**
 * @file er-sync.js
 * @description Verifies that a change to NAVN (short name) in ER is correctly
 * propagated to Altinn Register.
 *
 * k6 run er-sync.js \
 *   -e ENVIRONMENT=at22 -e BASE_URL=https://platform.at22.altinn.cloud \
 *   -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> \
 *   -e REGISTER_SUBSCRIPTION_KEY=<key>
 *
 * @requires ENV.ENVIRONMENT                - Target environment (e.g. tt02, at22)
 * @requires ENV.BASE_URL                   - Base URL for the Register API
 * @requires ENV.SOAP_ER_USERNAME           - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD           - Password for the ER SOAP API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY  - Subscription key for the Register API
 */

export const options = {
    scenarios: {
        "change-org-short-name": { executor: "shared-iterations", exec: "nameShortChange", vus: 1, iterations: 1 },
    },
};

const INNH = { fnr: "12864421537", fornavn: "Elise", slektsnavn: "Testperson" };

function buildPrepXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
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
                    <rolleFoedselsnr>${INNH.fnr}</rolleFoedselsnr>
                    <fornavn>${INNH.fornavn}</fornavn>
                    <slektsnavn>${INNH.slektsnavn}</slektsnavn>
                    <postnr>1234</postnr>
                    <adresse1>Testveien 29</adresse1>
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

export function nameShortChange({ orgNr = generateOrgNr() } = {}) {
    const prep = buildPrepXml(orgNr);

    const change = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00301" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="ENK" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20210101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>NAVN CHANGE TEST ENK OPPDATERT</navn1>
                    <rednavn>NAVN CHANGE TEST ENK OPPDATERT</rednavn>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runErSyncTestcase(
        "Change organization short name",
        prep,
        change,
        orgNr,
        { "org name updated to NAVN CHANGE TEST ENK OPPDATERT": (p) => p.displayName === "NAVN CHANGE TEST ENK OPPDATERT" },
    );
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";

export function teardown({ orgNr } = {}) {
    if (!orgNr) return;
    const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
    SubmitErData(apiClient, buildCleanupXml(orgNr), "Cleanup");
}

function buildCleanupXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00402" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="ENK" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20210101" datoSistEndret="20260512">
                <samendringer data="D" felttype="INNH" endringstype="U" type="R">
                    <rolleFoedselsnr>${INNH.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}
