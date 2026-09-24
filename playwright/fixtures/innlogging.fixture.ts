import { Innlogging } from "../flows/innlogging";
import { test as miljoTest } from "./miljo.fixture";

export const test = miljoTest.extend<{ innlogging: Innlogging }>({
    innlogging: async ({ page, miljo, mockporten, urler }, use) => {
        await use(new Innlogging(page, miljo === "prod" || mockporten, urler.platform));
    },
});
