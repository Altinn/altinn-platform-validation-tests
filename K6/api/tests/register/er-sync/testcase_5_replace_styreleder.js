import { group, check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope, createAuthorizedPartiesClient, retryUntilHasAccess, retryUntilNoAccess } from "./helper.js";

/**
 * @file testcase_5_replace_styreleder.js
 * @description Verifies that a change to LEDE (Styreleder) in ER is correctly
 * synced to Altinn Register and reflected in authorized parties.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-5-replace-styreleder": { executor: "shared-iterations", exec: "styrChange", vus: 1, iterations: 1 },
    },
};

const OLD_STYRELEDER = { fnr: "16918598441", fornavn: "TREG", slektsnavn: "HUNKATT" };
const NEW_STYRELEDER = { fnr: "20845996750", fornavn: "TYPISK", slektsnavn: "TIMEBU" };
const STYREMEDLEM = { fnr: "57925901581", fornavn: "PASSIV", slektsnavn: "EKORNHALE" };
const DAGLIG_LEDER = { fnr: "18914598245", fornavn: "UTÅLMODIG", slektsnavn: "MASKIN" };


function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
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
                    <rolleFoedselsnr>${OLD_STYRELEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${OLD_STYRELEDER.fornavn}</fornavn>
                    <slektsnavn>${OLD_STYRELEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                    <fornavn>${STYREMEDLEM.fornavn}</fornavn>
                    <slektsnavn>${STYREMEDLEM.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${DAGLIG_LEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 14</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function styrChange() {
    const orgNr = generateOrgNr();
    console.log(`[TC5] orgNr: ${orgNr} | OLD_STYR: ${OLD_STYRELEDER.fnr} (${OLD_STYRELEDER.fornavn} ${OLD_STYRELEDER.slektsnavn}) | NEW_STYR: ${NEW_STYRELEDER.fnr} (${NEW_STYRELEDER.fornavn} ${NEW_STYRELEDER.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00322" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E"
            undersakstype="NY" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${OLD_STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="LEDE" endringstype="N" type="R">
                    <rolleFoedselsnr>${NEW_STYRELEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${NEW_STYRELEDER.fornavn}</fornavn>
                    <slektsnavn>${NEW_STYRELEDER.slektsnavn}</slektsnavn>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const apClient = createAuthorizedPartiesClient();

    // Phase 1: Prep - submit org with OLD_STYR and wait for Register
    runErSyncTestcase(
        "5. Replace styreleder (STYR) - Prep",
        prep,
        change,
        orgNr,
        {},
        { stopAfterPrep: true },
    );

    // Phase 2: Confirm OLD_STYR has access before testing replacement
    group("Verify - old STYR has access to org after prep", () => {
        retryUntilHasAccess(apClient, OLD_STYRELEDER.fnr, orgNr, "5. Replace styreleder - old STYR access granted");
    });

    // Phase 3: Submit the STYR replacement
    group("Change - submit STYR replacement", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, change, "Change");
    });

    // Phase 4: Verify new STYR has access
    group("Verify - new STYR has access to org", () => {
        const parties = retryUntilHasAccess(apClient, NEW_STYRELEDER.fnr, orgNr, "replace-styreleder - new STYR access");
        check(parties, {
            [`new Styreleder (${NEW_STYRELEDER.fornavn} ${NEW_STYRELEDER.slektsnavn}) has access to org`]: (p) =>
                Array.isArray(p) && p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });

    // Phase 5: Verify old STYR no longer has access
    group("Verify - old STYR no longer has access to org", () => {
        const parties = retryUntilNoAccess(apClient, OLD_STYRELEDER.fnr, orgNr, "replace-styreleder - old STYR access revoked");
        check(parties, {
            [`old STYR (${OLD_STYRELEDER.fornavn} ${OLD_STYRELEDER.slektsnavn}) no longer has access to org`]: (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });

    group("Cleanup", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, buildCleanupXml(orgNr), "Cleanup");
    });
}

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";

function buildCleanupXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00401" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="LEDE" endringstype="U" type="R">
                    <rolleFoedselsnr>${NEW_STYRELEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${STYREMEDLEM.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
