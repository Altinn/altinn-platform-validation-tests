import { InfoportalForside } from "../pages/infoportal/forside";
import { test as miljoTest } from "./miljo.fixture";

export type Infoportal = {
    forside: InfoportalForside;
};

export const test = miljoTest.extend<{ infoportal: Infoportal }>({
    infoportal: async ({ page, urler }, use) => {
        await use({
            forside: new InfoportalForside(page, urler.infoportal),
        });
    },
});
