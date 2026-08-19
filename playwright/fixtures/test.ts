import { mergeTests } from '@playwright/test';
import { test as arbeidsflate } from './arbeidsflate.fixture';
import { test as infoportal } from './infoportal.fixture';
import { test as innlogging } from './innlogging.fixture';
import { test as sprak } from './sprak.fixture';
import { test as tilgangsstyring } from './tilgangsstyring.fixture';
import { Side } from '../pages/side';
import { gjeldendeMiljo, Miljo } from '../config/miljo';

/**
 * Testene importerer `test` herfra. Hvert hovedområde har sin egen fixture-fil,
 * og nye områder legges til i mergeTests under.
 */
const test = mergeTests(innlogging, sprak, arbeidsflate, tilgangsstyring, infoportal);

/**
 * Begrenser en testfil eller et describe-blokk til miljøene den er kjent å virke i.
 * Kjører du mot et annet, rapporteres testene som skipped med begrunnelse framfor å
 * feile eller forsvinne stille. Et nytt miljø må derfor legges inn her, som også er
 * en anledning til å sjekke at testen faktisk virker der.
 */
export function kjoresIMiljoer(...miljoer: Miljo[]) {
    const gjeldende = gjeldendeMiljo();

    test.skip(
        !miljoer.includes(gjeldende),
        `Kjøres i ${miljoer.join(', ')}, ikke i ${gjeldende}`
    );
}

export type Flate =
    | 'arbeidsflate'
    | 'arbeidsflate-profil'
    | 'tilgangsstyring'
    | 'infoportalen';

/**
 * Oppslag fra flatenavn til side, for testene som går på tvers av flatene.
 * Testene som holder seg innenfor ett område bruker områdefixturen direkte.
 */
export const testMedFlater = test.extend<{ flater: Record<Flate, Side> }>({
    flater: async ({ arbeidsflate, tilgangsstyring, infoportal }, use) => {
        await use({
            'arbeidsflate': arbeidsflate.forside,
            'arbeidsflate-profil': arbeidsflate.profil,
            'tilgangsstyring': tilgangsstyring.forside,
            'infoportalen': infoportal.forside,
        });
    },
});

export { test };
export { expect } from '@playwright/test';
