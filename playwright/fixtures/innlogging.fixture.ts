import { Innlogging } from "../flows/innlogging";
import { test as miljoTest } from "./miljo.fixture";

export const test = miljoTest.extend<{ innlogging: Innlogging }>({
    innlogging: async ({ page, mockporten, urler }, use) => {
        await use(new Innlogging(page, mockporten, urler.platform));
    },
});
