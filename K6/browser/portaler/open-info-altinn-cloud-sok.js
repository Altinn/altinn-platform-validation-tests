
import { browser } from "k6/browser";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { expect } from "../../common-imports.js";
import { getOptions } from "./common.js";

export const options = getOptions();





export default async function () {
    const url = `${__ENV.INFO_CLOUD_URL}/sok/?q=test`;
    const page = await browser.newPage();
    try {
        await page.goto(url);

        const currentUrl = page.url();
        check(currentUrl, {
            currentUrl: (h) => h.includes(url),
        });

        const text = await page
            .getByText("Søk på altinn.no")
            .textContent();

        check(text, {
            "Text includes Søk på altinn.no": (h) => h.includes("Søk på altinn.no"),
        });
    }
    catch (error) {
        console.error(`Error opening ${url}:`, error);
    }
    finally {
        await page.close();
    }
}
