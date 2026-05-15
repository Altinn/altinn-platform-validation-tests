import { group, check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient } from "../../../../clients/authentication/index.js";
import { generateOrgNr, retry } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";

/**
 * @file change-styr.js
 * @description Verifies that a change to LEDE (Styreleder) in ER is correctly
 * propagated to Altinn Register and reflected in authorized parties.
 *
 * k6 run change-styr.js \
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
        "testcase-styr-change": { executor: "shared-iterations", exec: "styrChange", vus: 1, iterations: 1 },
    },
};

const OLD_STYR_FNR = "16918598441"; // TREG HUNKATT

// Want to verify this person is added to the org
const NEW_STYR_FNR = "56828300941"; // ETTERPÅKLOK MÅNEFERD
const MEDL_FNR = "57925901581"; // PASSIV EKORNHALE
const DAGL_FNR = "18914598245";

function getAuthorizedParties(apClient, fnr) {
    const res = apClient.GetAuthorizedParties(
        "urn:altinn:person:identifier-no",
        fnr,
        { includeAltinn2: false, includePartiesViaKeyRoles: true },
    );
    if (res.status !== 200) return null;
    return res.json();
}

function buildPrepXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00230" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>BYTTE STYRELEDER AS</navn1>
                    <rednavn>BYTTE STYRELEDER AS</rednavn>
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
                    <rolleFoedselsnr>${OLD_STYR_FNR}</rolleFoedselsnr>
                    <fornavn>TREG</fornavn>
                    <slektsnavn>HUNKATT</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${MEDL_FNR}</rolleFoedselsnr>
                    <fornavn>PASSIV</fornavn>
                    <slektsnavn>EKORNHALE</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${DAGL_FNR}</rolleFoedselsnr>
                    <fornavn>ALLSLAGS</fornavn>
                    <slektsnavn>VIFTE</slektsnavn>
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
}

export function styrChange() {
    const orgNr = generateOrgNr();

    const change = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00322" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E"
            undersakstype="NY" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${OLD_STYR_FNR}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="LEDE" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_STYR_FNR}</rolleFoedselsnr>
                    <fornavn>ETTERPÅKLOK</fornavn>
                    <slektsnavn>MÅNEFERD</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runErSyncTestcase(
        "testcase-styr-change",
        [buildPrepXml(orgNr)],
        change,
        orgNr,
        { "org is accessible in Register after STYR change": (p) => p.partyType === "organization" },
    );

    if (__ENV.STOP_AFTER_PREP === "true") return;

    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
    const apClient = new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));

    group("Verify - new STYR has access to org", () => {
        let verifiedParties = null;
        retry(
            () => {
                const parties = getAuthorizedParties(apClient, NEW_STYR_FNR);
                if (!parties) {
                    console.log("[testcase-styr-change] New STYR: authorized parties not yet available");
                    return false;
                }
                const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
                if (!hasAccess) console.log(`[testcase-styr-change] New STYR does not yet have access to org ${orgNr}`);
                if (hasAccess) verifiedParties = parties;
                return hasAccess;
            },
            { retries: 15, intervalSeconds: 20, testscenario: "testcase-styr-change - new STYR access" },
        );
        check(verifiedParties, {
            "new STYR (ETTERPÅKLOK MÅNEFERD) has access to org": (p) => p !== null,
        });
    });

    group("Verify - old STYR no longer has access to org", () => {
        const parties = getAuthorizedParties(apClient, OLD_STYR_FNR);
        check(parties, {
            "old STYR (TREG HUNKATT) no longer has access to org": (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });
}

// Reporting tools
export { handleSummary } from "../../../../common-imports.js";
