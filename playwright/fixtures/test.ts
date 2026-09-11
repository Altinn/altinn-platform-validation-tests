import { mergeTests } from '@playwright/test';
import { test as arbeidsflate } from './arbeidsflate.fixture';
import { test as cookiebanner } from './cookiebanner.fixture';
import { test as infoportal } from './infoportal.fixture';
import { test as innlogging } from './innlogging.fixture';
import { test as sprak } from './sprak.fixture';
import { test as testbruker } from './testbruker.fixture';
import { test as tilgangsstyring } from './tilgangsstyring.fixture';
import { Side } from '../pages/side';

export type Flate =
    | 'arbeidsflate'
    | 'arbeidsflate-profil'
    | 'tilgangsstyring'
    | 'infoportalen';

/**
 * Testene importerer `test` herfra. Hvert hovedområde har sin egen fixture-fil, og
 * nye områder legges til i mergeTests under.
 *
 * `sider` er landingssiden på hver flate, for testene som går på tvers av dem.
 * Testene som holder seg innenfor ett område bruker områdefixturen direkte.
 */
const test = mergeTests(
    innlogging,
    testbruker,
    sprak,
    cookiebanner,
    arbeidsflate,
    tilgangsstyring,
    infoportal
).extend<{ sider: Record<Flate, Side> }>({
    sider: async ({ arbeidsflate, tilgangsstyring, infoportal }, use) => {
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
