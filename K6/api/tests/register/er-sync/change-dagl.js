import { group, check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient, RegisterApiClient } from "../../../../clients/authentication/index.js";
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
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
        "replace-daglig-leder": { executor: "shared-iterations", exec: "daglChange", vus: 1, iterations: 1 },
    },
};

const OLD_DAGL = { fnr: "20875798538", fornavn: "TALEFØR",  slektsnavn: "HAKE" };
const NEW_DAGL = { fnr: "26858396815", fornavn: "FLYKTIG",  slektsnavn: "GASSPEDAL" };
const LEDE     = { fnr: "02895823468", fornavn: "Anne",     slektsnavn: "Testperson" };
const MEDL     = { fnr: "07855812899", fornavn: "Ola Test", slektsnavn: "Testperson" };


function buildPrepXml(orgNr) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
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
                    <navn1>DAGL CHANGE TEST AS</navn1>
                    <rednavn>DAGL CHANGE TEST AS</rednavn>
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
                    <rolleFoedselsnr>${LEDE.fnr}</rolleFoedselsnr>
                    <fornavn>${LEDE.fornavn}</fornavn>
                    <slektsnavn>${LEDE.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${MEDL.fnr}</rolleFoedselsnr>
                    <fornavn>${MEDL.fornavn}</fornavn>
                    <slektsnavn>${MEDL.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${OLD_DAGL.fnr}</rolleFoedselsnr>
                    <fornavn>${OLD_DAGL.fornavn}</fornavn>
                    <slektsnavn>${OLD_DAGL.slektsnavn}</slektsnavn>
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

export function setup() {
    return { orgNr: generateOrgNr() };
}

export function daglChange({ orgNr = generateOrgNr() } = {}) {
    const prep = buildPrepXml(orgNr);

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
                    <rolleFoedselsnr>${OLD_DAGL.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_DAGL.fnr}</rolleFoedselsnr>
                    <fornavn>${NEW_DAGL.fornavn}</fornavn>
                    <slektsnavn>${NEW_DAGL.slektsnavn}</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    group("Replace Daglig leder (DAGL)", () => {
        runErSyncTestcase(
            "Replace Daglig leder - register",
            prep,
            change,
            orgNr,
            { "org is accessible in Register after DAGL change": (p) => p.partyType === "organization" },
        );

        if (__ENV.STOP_AFTER_PREP === "true") return;

        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
        const apClient = new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));

        group("Verify - new DAGL has access to org", () => {
            let verifiedParties = null;
            retry(
                () => {
                    const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", NEW_DAGL.fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
                    if (!Array.isArray(parties)) return false;
                    // TODO: tighten field name once response shape is confirmed (organizationNumber vs orgNumber)
                    const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
                    if (hasAccess) verifiedParties = parties;
                    return hasAccess;
                },
                { retries: 15, intervalSeconds: 20, testscenario: "replace-daglig-leder - new DAGL access" },
            );
            check(verifiedParties, {
                [`new DAGL (${NEW_DAGL.fornavn} ${NEW_DAGL.slektsnavn}) has access to org`]: (p) => p !== null,
            });
        });

        group("Verify - old DAGL no longer has access to org", () => {
            const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", OLD_DAGL.fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
            check(parties, {
                [`old DAGL (${OLD_DAGL.fornavn} ${OLD_DAGL.slektsnavn}) no longer has access to org`]: (p) =>
                    Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
            });
        });
    });
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
            <head avsender="ER" dato="20260512" kjoerenr="00406" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${LEDE.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${MEDL.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${NEW_DAGL.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}
