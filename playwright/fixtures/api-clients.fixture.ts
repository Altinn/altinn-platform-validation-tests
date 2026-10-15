import { test as base } from "@playwright/test";

import { erDialogSynligForPerson } from "../config/clients/dialogporten/enduser";
import { authorize, Decision } from "../config/clients/pdp";
import { Urler } from "../config/environment";

/**
 * Fixtures for de rene API-klientene (PDP og Dialogportens enduser-API), bundet
 * til miljøet testen allerede kjører i (`urler.platform`/`miljo`) slik at
 * kalleren bare trenger å oppgi det spørsmålet faktisk handler om: hvem, mot
 * hvilken virksomhet, på hvilken ressurs.
 *
 * NB, diskusjonspunkt fra PR #676: dette er ett forslag til hvordan
 * API-klientene kan eksponeres som fixtures (jf. K6-mønsteret), ikke en
 * fasit. Fortsatt åpent:
 * - Bør `pdp`/`dialogportenEnduser` heller være klasser à la K6s
 *   `EnduserApiClient`, for tettere paritet med K6-koden de er portert fra?
 * - `tokenGenerator` er bevisst IKKE gjort om til en fixture ennå: testen
 *   trenger tokens for flere ulike identiteter (DAGL, person B, tjenesteeier)
 *   i samme kjøring, så en fixture for den måtte vært en factory
 *   (`getToken(options) => Promise<string>`), ikke en enkelt verdi — verdt å
 *   prøve ut i pairingen.
 */
export const apiClientsFixture = base.extend<{
    urler: Urler;
    miljo: string;
    pdp: {
        authorize(pid: string, orgNo: string, resourceId: string, action: string): Promise<Decision>;
    };
    dialogportenEnduser: {
        erDialogSynlig(personPid: string, orgNo: string, resourceId: string): Promise<boolean>;
    };
}>({
    urler: [{} as Urler, { option: true }],
    miljo: ["", { option: true }],

    pdp: async ({ urler, miljo }, use) => {
        await use({
            authorize: (pid, orgNo, resourceId, action) => authorize(urler.platform, miljo, pid, orgNo, resourceId, action),
        });
    },

    dialogportenEnduser: async ({ urler, miljo }, use) => {
        await use({
            erDialogSynlig: (personPid, orgNo, resourceId) => erDialogSynligForPerson(urler.platform, miljo, personPid, orgNo, resourceId),
        });
    },
});
