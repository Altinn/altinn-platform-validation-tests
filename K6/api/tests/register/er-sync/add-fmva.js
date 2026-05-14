import { group, check } from "k6";
import { PlatformTokenGenerator } from "../../../../common-imports.js";
import { RegisterApiClient, RegisterLookupClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { retry, generateOrgNr } from "../../../../helpers.js";

/**
 * @file add-fmva.js
 * @description Verifies that adding FMVA (Frivillig MVA-registrering) in ER is correctly
 * propagated to Altinn Register.
 *
 * k6 run add-fmva.js \
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
        "testcase-add-fmva": { executor: "shared-iterations", exec: "addFmva", vus: 1, iterations: 1 },
    },
};

// ── Shared test runner ────────────────────────────────────────────────────────

function pollOrganization(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party,person,org,user,si,sysuser", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
    return JSON.parse(res.body)?.data?.[0] ?? null;
}

function runTestcase(scenarioName, preps, changeXml, orgNr, verifyChecks) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const apiClient    = new RegisterApiClient(__ENV.BASE_URL, null);
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
                        console.log(`[${scenarioName}] Org ${orgNr} not yet visible in Register after prep`);
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
                        console.log(`[${scenarioName}] Org ${orgNr} not yet visible in Register`);
                        return false;
                    }
                    const conditionMet = Object.values(verifyChecks).every(fn => fn(party));
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

// ── Testcase ──────────────────────────────────────────────────────────────────

export function addFmva() {
    const orgNr = generateOrgNr();

    const prep = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
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
                    <navn1>ER SYNC AS</navn1>
                    <rednavn>ER SYNC AS</rednavn>
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
                    <rolleFoedselsnr>02895823468</rolleFoedselsnr>
                    <fornavn>Anne</fornavn>
                    <slektsnavn>Testperson</slektsnavn>
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

    runTestcase(
        "testcase-add-fmva",
        [prep],
        change,
        orgNr,
        { "org is accessible in Register after FMVA added": (p) => p.partyType === "organization" },
    );
}

// Reporting tools
export { handleSummary } from "../../../../common-imports.js";
