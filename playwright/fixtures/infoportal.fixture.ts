import { InfoportalForside } from "../pages/infoportal/forside";
import { test as options } from "./options.fixture";

export type Infoportal = {
    forside: InfoportalForside;
};

export const test = options.extend<{ infoportal: Infoportal }>({
    infoportal: async ({ page, urler }, use) => {
        await use({
            forside: new InfoportalForside(page, urler.infoportal),
        });
    },
});
