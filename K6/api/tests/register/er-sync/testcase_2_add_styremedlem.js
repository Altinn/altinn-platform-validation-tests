import { group, check } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient, RegisterApiClient } from "../../../../clients/authentication/index.js";
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr, retry } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope } from "./helper.js";

/**
 * @file testcase_2_add_styremedlem.js
 * @description Verifies that adding a MEDL (Styremedlem) in ER is correctly
 * synced to Altinn Register and reflected in authorized parties.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-2-add-styremedlem": { executor: "shared-iterations", exec: "addMedl", vus: 1, iterations: 1 },
    },
};

const DAGLIG_LEDER = { fnr: "09861798434", fornavn: "AKADEMISK", slektsnavn: "HAKE" };
const NYTT_STYREMEDLEM = { fnr: "10921148513", fornavn: "UKLAR", slektsnavn: "PLAST" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00240" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>ADD MEDL TEST AS</navn1>
                    <rednavn>ADD MEDL TEST AS</rednavn>
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

export function addMedl() {
    const orgNr = generateOrgNr();
    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00330" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="NY" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="MEDL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${NYTT_STYREMEDLEM.fnr}</rolleFoedselsnr>
                    <fornavn>${NYTT_STYREMEDLEM.fornavn}</fornavn>
                    <slektsnavn>${NYTT_STYREMEDLEM.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 12</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
    const apClient = new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));

    runErSyncTestcase(
        "2. Add styremedlem (MEDL)",
        prep,
        change,
        orgNr,
        { "org is accessible in Register after MEDL added": (p) => p.partyType === "organization" },
    );

    group("Verify - new MEDL has access to org", () => {
        let verifiedParties = null;
        retry(
            () => {
                const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", NEW_MEDL.fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
                if (!Array.isArray(parties)) return false;
                const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
                if (hasAccess) verifiedParties = parties;
                return hasAccess;
            },
            { retries: 15, intervalSeconds: 20, testscenario: "add-board-member - new MEDL access" },
        );
        check(verifiedParties, {
            [`new MEDL (${NYTT_STYREMEDLEM.fornavn} ${NYTT_STYREMEDLEM.slektsnavn}) has access to org`]: (p) => p !== null,
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
            <head avsender="ER" dato="20260512" kjoerenr="00410" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="AS" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
                <samendringer data="D" felttype="MEDL" endringstype="U" type="R">
                    <rolleFoedselsnr>${NYTT_STYREMEDLEM.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
