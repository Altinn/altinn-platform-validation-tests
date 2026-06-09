import { group, check } from "k6";
import { RegisterApiClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { generateOrgNr } from "../../../../helpers.js";
import { runErSyncTestcase, buildErSoapEnvelope, createAuthorizedPartiesClient, retryUntilHasAccess, retryUntilNoAccess } from "./helper.js";

/**
 * @file testcase_11_kont_nuf.js
 * @description Verifies that adding a KONT (kontaktperson) role to a NUF organization
 * also grants kontaktperson-nuf access (secondary role dispatch), and that removing
 * KONT revokes access for both roles.
 * @see README.md
 */

export const options = {
    scenarios: {
        "testcase-11-kont-nuf": { executor: "shared-iterations", exec: "kontNuf", vus: 1, iterations: 1 },
    },
};

const DAGLIG_LEDER = { fnr: "27877699310", fornavn: "INKONSEKVENT", slektsnavn: "POTET" };
const KONTAKTPERSON = { fnr: "30915999766", fornavn: "OPPRETT", slektsnavn: "FASTE" };

function buildPrepXml(orgNr) {
    return buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00160" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="NUF" hovedsakstype="N" undersakstype="NY" foersteOverfoering="J" datoFoedt="20200101" datoSistEndret="20260512">
                <infotype felttype="NAVN" endringstype="N">
                    <navn1>KONT NUF TEST NUF</navn1>
                    <rednavn>KONT NUF TEST NUF</rednavn>
                </infotype>
                <infotype felttype="FADR" endringstype="N">
                    <postnr>0150</postnr>
                    <landkode>NO</landkode>
                    <kommunenr>0301</kommunenr>
                    <adresse1>Testveien 1</adresse1>
                </infotype>
                <samendringer data="D" felttype="DAGL" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                    <fornavn>${DAGLIG_LEDER.fornavn}</fornavn>
                    <slektsnavn>${DAGLIG_LEDER.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 10</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
                <samendringer data="D" felttype="KONT" endringstype="N" type="R">
                    <rolleFratraadt>N</rolleFratraadt>
                    <rolleRekkefoelge>1</rolleRekkefoelge>
                    <rolleFoedselsnr>${KONTAKTPERSON.fnr}</rolleFoedselsnr>
                    <fornavn>${KONTAKTPERSON.fornavn}</fornavn>
                    <slektsnavn>${KONTAKTPERSON.slektsnavn}</slektsnavn>
                    <postnr>0150</postnr>
                    <adresse1>Testveien 11</adresse1>
                    <adresseLandkode>NO</adresseLandkode>
                    <personstatus>L</personstatus>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}

export function kontNuf() {
    const orgNr = generateOrgNr();
    console.log(`[TC11] orgNr: ${orgNr} | DAGLIG_LEDER: ${DAGLIG_LEDER.fnr} (${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn}) | KONTAKTPERSON: ${KONTAKTPERSON.fnr} (${KONTAKTPERSON.fornavn} ${KONTAKTPERSON.slektsnavn})`);

    const prep = buildPrepXml(orgNr);

    const change = buildErSoapEnvelope(`<batchAjourholdXML>
            <head avsender="ER" dato="20260512" kjoerenr="00260" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="NUF" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="KONT" endringstype="U" type="R">
                    <rolleFoedselsnr>${KONTAKTPERSON.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);

    const apClient = createAuthorizedPartiesClient();

    // Phase 1: Prep - register NUF org with DAGL + KONT and wait for Register
    runErSyncTestcase(
        "11. KONT på NUF - Prep",
        prep,
        change,
        orgNr,
        {},
        { stopAfterPrep: true },
    );

    // Phase 2: Confirm KONT has access before testing removal
    // KONT on a NUF org should grant both kontaktperson and kontaktperson-nuf
    group("Verify - KONT has access to org after prep", () => {
        retryUntilHasAccess(apClient, KONTAKTPERSON.fnr, orgNr, "11. KONT på NUF - KONT access granted");
    });

    // Phase 3: Submit KONT removal
    group("Change - remove KONT", () => {
        const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
        SubmitErData(apiClient, change, "Change");
    });

    // Phase 4: Verify KONT no longer has access (both kontaktperson and kontaktperson-nuf revoked)
    group("Verify - KONT no longer has access after removal", () => {
        const parties = retryUntilNoAccess(apClient, KONTAKTPERSON.fnr, orgNr, "11. KONT på NUF - KONT access revoked");
        check(parties, {
            [`${KONTAKTPERSON.fornavn} ${KONTAKTPERSON.slektsnavn} no longer has access to org`]: (p) =>
                Array.isArray(p) && !p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
        });
    });

    // Phase 5: Verify DAGL still has access (KONT removal should not affect DAGL)
    group("Verify - DAGL retains access after KONT removal", () => {
        const parties = retryUntilHasAccess(apClient, DAGLIG_LEDER.fnr, orgNr, "11. KONT på NUF - DAGL unaffected");
        check(parties, {
            [`${DAGLIG_LEDER.fornavn} ${DAGLIG_LEDER.slektsnavn} (DAGL) still has access after KONT removal`]: (p) =>
                Array.isArray(p) && p.some((party) => party.organizationNumber === orgNr || party.orgNumber === orgNr),
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
            <head avsender="ER" dato="20260512" kjoerenr="00360" mottaker="ALT" type="A" />
            <enhet organisasjonsnummer="${orgNr}" organisasjonsform="NUF" hovedsakstype="E" undersakstype="EN" foersteOverfoering="N" datoFoedt="20200101" datoSistEndret="20260512">
                <samendringer data="D" felttype="DAGL" endringstype="U" type="R">
                    <rolleFoedselsnr>${DAGLIG_LEDER.fnr}</rolleFoedselsnr>
                </samendringer>
            </enhet>
            <trai antallEnheter="1" avsender="ER" />
        </batchAjourholdXML>`);
}
