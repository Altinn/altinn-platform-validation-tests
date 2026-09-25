import { getTestUser, TestUser } from "../config/environment";
import { Innlogging } from "../flows/innlogging";
import { test as options } from "./options.fixture";

export const test = options.extend<{ innlogging: Innlogging; user: TestUser }>({
    innlogging: async ({ page, mockporten, urler }, use) => {
        await use(new Innlogging(page, mockporten, urler.platform));
    },

    user: async ({ }, use) => {
        await use(getTestUser());
    },
});
