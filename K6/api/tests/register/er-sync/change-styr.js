import { group, check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient, RegisterApiClient } from "../../../../clients/authentication/index.js";
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr, retry } from "../../../../helpers.js";
import { runErSyncTestcase } from "./helper.js";

/**
 * @file change-styr.js
 * @description Verifies that a change to LEDE (Styreleder) in ER is correctly
 * synced to Altinn Register and reflected in authorized parties.
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
        "replace-styreleder": { executor: "shared-iterations", exec: "styrChange", vus: 1, iterations: 1 },
    },
};

const OLD_STYR = { fnr: "16918598441", fornavn: "TREG", slektsnavn: "HUNKATT" };
const NEW_STYR = { fnr: "20845996750", fornavn: "TYPISK", slektsnavn: "TIMEBU" };
const MEDL = { fnr: "57925901581", fornavn: "PASSIV", slektsnavn: "EKORNHALE" };
const DAGL = { fnr: "18914598245", fornavn: "UTÅLMODIG", slektsnavn: "MASKIN" };


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
                    <rolleFoedselsnr>${OLD_STYR.fnr}</rolleFoedselsnr>
                    <fornavn>${OLD_STYR.fornavn}</fornavn>
                    <slektsnavn>${OLD_STYR.slektsnavn}</slektsnavn>
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
                    <rolleFoedselsnr>${DAGL.fnr}</rolleFoedselsnr>
                    <fornavn>${DAGL.fornavn}</fornavn>
                    <slektsnavn>${DAGL.slektsnavn}</slektsnavn>
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

export function styrChange({ orgNr = generateOrgNr() } = {}) {
    const prep = buildPrepXml(orgNr);

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
                    <rolleFoedselsnr>${OLD_STYR.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="LEDE" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_STYR.fnr}</rolleFoedselsnr>
                    <fornavn>${NEW_STYR.fornavn}</fornavn>
                    <slektsnavn>${NEW_STYR.slektsnavn}</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;

    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
    const apClient = new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));

    runErSyncTestcase(
        "Replace Styreleder (STYR)",
        prep,
        change,
        orgNr,
        { "org is accessible in Register after Styreleder is replaced": (p) => p.partyType === "organization" },
        {
            afterChange: () => {
                group("Verify - new STYR has access to org", () => {
                    let verifiedParties = null;
                    retry(
                        () => {
                            const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", NEW_STYR.fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
                            if (!Array.isArray(parties)) return false;
                            const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
                            if (hasAccess) verifiedParties = parties;
                            return hasAccess;
                        },
                        { retries: 15, intervalSeconds: 20, testscenario: "replace-styreleder - new STYR access" },
                    );
                    check(verifiedParties, {
                        [`new STYR (${NEW_STYR.fornavn} ${NEW_STYR.slektsnavn}) has access to org`]: (p) => p !== null,
                    });
                });

                group("Verify - old STYR no longer has access to org", () => {
                    const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", OLD_STYR.fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
                    check(parties, {
                        [`old STYR (${OLD_STYR.fornavn} ${OLD_STYR.slektsnavn}) no longer has access to org`]: (p) =>
                            Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
                    });
                });
            },
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
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00401" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${NEW_STYR.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${MEDL.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGL.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}
