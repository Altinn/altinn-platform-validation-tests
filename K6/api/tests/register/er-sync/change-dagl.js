import { group, check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient } from "../../../../clients/authentication/index.js";
import { generateOrgNr, retry } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";

/**
 * @file change-dagl.js
 * @description Verifies that a change to DAGL (Daglig leder) in ER is correctly
 * propagated to Altinn Register and reflected in authorized parties.
 *
 * k6 run change-dagl.js \
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
        "testcase-dagl-change": { executor: "shared-iterations", exec: "daglChange", vus: 1, iterations: 1 },
    },
};

const OLD_DAGL_FNR = "20875798538"; // TALEFØR HAKE
const NEW_DAGL_FNR = "26858396815"; // FLYKTIG GASSPEDAL

function getAuthorizedParties(apClient, fnr) {
    const res = apClient.GetAuthorizedParties(
        "urn:altinn:person:identifier-no",
        fnr,
        { includeAltinn2: false, includePartiesViaKeyRoles: true },
    );
    if (res.status !== 200) return null;
    return res.json();
}

export function daglChange() {
    const orgNr = generateOrgNr();

    const prep = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00214" mottaker="ALT" type="A" />
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
                    <rolleFoedselsnr>02895823468</rolleFoedselsnr>
                    <fornavn>Anne</fornavn>
                    <slektsnavn>Testperson</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>07855812899</rolleFoedselsnr>
                    <fornavn>Ola Test</fornavn>
                    <slektsnavn>Testperson</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${OLD_DAGL_FNR}</rolleFoedselsnr>
                    <fornavn>TALEFØR</fornavn>
                    <slektsnavn>HAKE</slektsnavn>
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
            <head avsender="ER" dato="20260512" kjoerenr="00310" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="NY" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${OLD_DAGL_FNR}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_DAGL_FNR}</rolleFoedselsnr>
                    <fornavn>FLYKTIG</fornavn>
                    <slektsnavn>GASSPEDAL</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    runErSyncTestcase(
        "testcase-dagl-change",
        [prep],
        change,
        orgNr,
        { "org is accessible in Register after DAGL change": (p) => p.partyType === "organization" },
    );

    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
    const apClient = new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));

    group("Verify - new DAGL has access to org", () => {
        let verifiedParties = null;
        retry(
            () => {
                const parties = getAuthorizedParties(apClient, NEW_DAGL_FNR);
                if (!parties) {
                    console.log(`[testcase-dagl-change] New DAGL: authorized parties not yet available`);
                    return false;
                }
                // TODO: tighten field name once response shape is confirmed (organizationNumber vs orgNumber)
                const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
                if (!hasAccess) console.log(`[testcase-dagl-change] New DAGL does not yet have access to org ${orgNr}`);
                if (hasAccess) verifiedParties = parties;
                return hasAccess;
            },
            { retries: 15, intervalSeconds: 20, testscenario: "testcase-dagl-change - new DAGL access" },
        );
        check(verifiedParties, {
            "new DAGL (FLYKTIG GASSPEDAL) has access to org": (p) => p !== null,
        });
    });

    group("Verify - old DAGL no longer has access to org", () => {
        const parties = getAuthorizedParties(apClient, OLD_DAGL_FNR);
        check(parties, {
            "old DAGL (TALEFØR HAKE) no longer has access to org": (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });
}

// Reporting tools
export { handleSummary } from "../../../../common-imports.js";
