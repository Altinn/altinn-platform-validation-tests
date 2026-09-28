import { mergeTests } from "@playwright/test";

import { arbeidsflateFixture } from "./arbeidsflate.fixture";
import { infoportalFixture } from "./infoportal.fixture";
import { innloggingFixture } from "./innlogging.fixture";
import { testbrukereFixture } from "./testbrukere.fixture";
import { tilgangsstyringFixture } from "./tilgangsstyring.fixture";

// Det eneste stedet testene importerer fra. urler, sprak, mockporten og miljo
// settes av projectene i playwright.config.ts.
export const test = mergeTests(
    arbeidsflateFixture,
    tilgangsstyringFixture,
    infoportalFixture,
    innloggingFixture,
    testbrukereFixture,
);

export { expect } from "@playwright/test";
