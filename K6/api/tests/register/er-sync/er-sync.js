import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";

/**
 * @file er-sync.js
 * @description Verifies that ER (Enhetsregisteret) changes are correctly propagated
 * to Altinn Register. Each testcase is a named scenario that can be run individually.
 *
 * Run a specific testcase:
 *   k6 run er-sync.js --scenario testcase-name-short-change \
 *     -e ENVIRONMENT=tt02 -e BASE_URL=https://platform.tt02.altinn.cloud \
 *     -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> \
 *     -e REGISTER_SUBSCRIPTION_KEY=<key>
 *
 * Run all testcases:
 *   k6 run er-sync.js -e ENVIRONMENT=... (same env vars)
 *
 * @requires ENV.ENVIRONMENT                - Target environment (e.g. tt02, at22)
 * @requires ENV.BASE_URL                   - Base URL for the Register API
 * @requires ENV.SOAP_ER_USERNAME           - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD           - Password for the ER SOAP API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY  - Subscription key for the Register API
 */

export const options = {
    scenarios: {
        "testcase-name-short-change": { executor: "shared-iterations", exec: "nameShortChange", vus: 1, iterations: 1 },
    },
};

export function nameShortChange() {
    const orgNr = generateOrgNr();

    const prep = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
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
                    <navn1>ER SYNC ENK</navn1>
                    <rednavn>ER SYNC ENK</rednavn>
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
                    <rolleFoedselsnr>12864421537</rolleFoedselsnr>
                    <fornavn>Elise</fornavn>
                    <slektsnavn>Testperson</slektsnavn>
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
                    <navn1>ER SYNC ENK OPPDATERT</navn1>
                    <rednavn>ER SYNC ENK OPPDATERT</rednavn>
                </infotype>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runErSyncTestcase(
        "testcase-name-short-change",
        [prep],
        change,
        orgNr,
        { "org name updated to ER SYNC ENK OPPDATERT": (p) => p.displayName === "ER SYNC ENK OPPDATERT" },
    );
}

// Reporting tools
export { handleSummary } from "../../../../common-imports.js";
