import { test as base } from "@playwright/test";
import { getTestUsers } from "../config/testdata";
import { Miljo, Urler, urler } from "../miljo";
import { Testbruker } from "../testdata";

/**
 * Miljøet settes av projectet i playwright.config.ts, og URLene til flatene
 * følger av det. Resten av fixturene og page objectene får dem herfra.
 */
export const test = base.extend<
  { urler: Urler },
  { miljo: Miljo; testdataFinnes: void }
>({
  miljo: [undefined as unknown as Miljo, { option: true, scope: "worker" }],

  // Manglende testdata for en brukergruppe stopper workeren før første test.
  testdataFinnes: [
    async ({ miljo }, use) => {
      for (const gruppe of Object.values(Testbruker)) {
        getTestUsers(gruppe, miljo);
      }
      await use();
    },
    { scope: "worker", auto: true },
  ],

  urler: async ({ miljo }, use) => {
    await use(urler[miljo]);
  },
});
