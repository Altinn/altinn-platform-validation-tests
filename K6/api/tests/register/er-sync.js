import { group, check } from "k6";
import { PlatformTokenGenerator } from "../../../common-imports.js";
import { RegisterApiClient, RegisterLookupClient } from "../../../clients/authentication/index.js";
import { SubmitErData } from "../../building-blocks/register/index.js";
import { retry, generateOrgNr } from "../../../helpers.js";

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

// ── Shared test runner ────────────────────────────────────────────────────────

function pollParty(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
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
        group("Prep - submit new organization to ER", () => {
            for (const prep of preps) {
                const res = SubmitErData(apiClient, prep, __ENV.SOAP_ER_USERNAME, __ENV.SOAP_ER_PASSWORD);
                console.log(`[${scenarioName}] Prep response: ${res.status} ${res.body}`);
            }
        });

        group("Prep - verify organization is visible in Register", () => {
            let prepParty = null;
            retry(
                () => {
                    const party = pollParty(lookupClient, orgNr);
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

        group("Change - submit new name to Register", () => {
            const res = SubmitErData(apiClient, changeXml, __ENV.SOAP_ER_USERNAME, __ENV.SOAP_ER_PASSWORD);
            console.log(`[${scenarioName}] Change response: ${res.status} ${res.body}`);
        });

        group("Verify Register is updated with new name", () => {
            let verifiedParty = null;
            retry(
                () => {
                    const party = pollParty(lookupClient, orgNr);
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

export function nameShortChange() {
    const orgNr = generateOrgNr();

    const prep = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>\${soapErUsername}</ns:systemUserName>
        <ns:systemPassword>\${soapErPassword}</ns:systemPassword>
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
        <ns:systemUserName>\${soapErUsername}</ns:systemUserName>
        <ns:systemPassword>\${soapErPassword}</ns:systemPassword>
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

    runTestcase(
        "testcase-name-short-change",
        [prep],
        change,
        orgNr,
        { "org name updated to ER SYNC ENK OPPDATERT": (p) => p.displayName === "ER SYNC ENK OPPDATERT" },
    );
}

// Reporting tools
export { handleSummary } from "../../../common-imports.js";
