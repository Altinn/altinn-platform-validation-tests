import { group, check } from "k6";
import { PlatformTokenGenerator } from "../../../../common-imports.js";
import { RegisterApiClient, RegisterLookupClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { retry, generateOrgNr } from "../../../../helpers.js";

/**
 * @file change-fadr.js
 * @description Verifies that a change to FADR (Forretningsadresse) in ER is correctly
 * propagated to Altinn Register.
 *
 * k6 run change-fadr.js \
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
        "testcase-fadr-change": { executor: "shared-iterations", exec: "fadrChange", vus: 1, iterations: 1 },
    },
};

function pollOrganization(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party,person,org,user,si,sysuser", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
    return JSON.parse(res.body)?.data?.[0] ?? null;
}

function runTestcase(scenarioName, preps, changeXml, orgNr, verifyChecks) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
    const lookupClient = new RegisterLookupClient(__ENV.BASE_URL, new PlatformTokenGenerator(tokenOpts));

    console.log(`[${scenarioName}] BASE_URL: ${__ENV.BASE_URL}`);
    console.log(`[${scenarioName}] Target org: ${orgNr}`);

    group(scenarioName, () => {
        group("Prep - submit organization to ER", () => {
            for (const prep of preps) {
                const res = SubmitErData(apiClient, prep);
                console.log(`[${scenarioName}] Prep response: ${res.status} ${res.body}`);
            }
        });

        group("Prep - verify organization is visible in Register", () => {
            let prepParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) {
                        console.log(`[${scenarioName}] Prep: Waiting for org to be added to register`);
                        return false;
                    }
                    prepParty = party;
                    return true;
                },
                { retries: 15, intervalSeconds: 20, testscenario: scenarioName },
            );
            if (prepParty) {
                console.log(`[${scenarioName}] Prep - org displayName: ${prepParty.displayName}`);
                check(prepParty, { "Prep - org is visible in Register": (p) => p.partyType === "organization" });
            }
        });

        group("Change - submit ER update", () => {
            const res = SubmitErData(apiClient, changeXml);
            console.log(`[${scenarioName}] Change response: ${res.status} ${res.body}`);
        });

        group("Verify - Register reflects change", () => {
            let verifiedParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) {
                        console.log(`[${scenarioName}] Waiting for org to have updated Fadr address`);
                        return false;
                    }
                    console.log(`[${scenarioName}] Waiting for org to have updated Fadr address - current: ${JSON.stringify(party.businessAddress)}`);
                    const conditionResults = Object.entries(verifyChecks).map(([label, fn]) => {
                        const result = fn(party);
                        if (!result) console.log(`[${scenarioName}] Condition not met: "${label}"`);
                        return result;
                    });
                    const conditionMet = conditionResults.every(Boolean);
                    if (conditionMet) verifiedParty = party;
                    return conditionMet;
                },
                { retries: 15, intervalSeconds: 20, testscenario: scenarioName },
            );
            if (verifiedParty) {
                check(verifiedParty, verifyChecks);
            }
        });
    });
}

export function fadrChange() {
    const orgNr = generateOrgNr();

    const prep = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00210" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>ER SYNC AS</navn1>
                    <rednavn>ER SYNC AS</rednavn>
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
                    <rolleFoedselsnr>02831899053</rolleFoedselsnr>
                    <fornavn>LILLA</fornavn>
                    <slektsnavn>NETTADRESSE</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>03823648714</rolleFoedselsnr>
                    <fornavn>SEIN</fornavn>
                    <slektsnavn>ELV</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>2</rolleRekkefoelge>
                    <rolleFoedselsnr>26812099719</rolleFoedselsnr>
                    <fornavn>STOR</fornavn>
                    <slektsnavn>KAPPE</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 13</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>05830299450</rolleFoedselsnr>
                    <fornavn>SPENNENDE</fornavn>
                    <slektsnavn>BRØKSTREK</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 14</adresse1>
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
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runTestcase(
        "testcase-fadr-change",
        [prep],
        change,
        orgNr,
        {
            "org businessAddress updated to Ny Forretningsgate 5": (p) => p.businessAddress?.address === "Ny Forretningsgate 5",
            "org businessAddress postalCode updated to 0350": (p) => p.businessAddress?.postalCode === "0350",
        },
    );
}

// Reporting tools
export { handleSummary } from "../../../../common-imports.js";
