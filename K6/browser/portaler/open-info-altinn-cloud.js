
import { browser } from "k6/browser";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { expect } from "../../common-imports.js";
import { getOptions } from "./common.js";
import { requireEnv } from "../../helpers.js";

export const options = getOptions();

export function setup() {
    requireEnv(["INFO_CLOUD_URL"]);
    return;
}

export default async function () {
    const page = await browser.newPage();
    const url = `${__ENV.INFO_CLOUD_URL}`;
    try {
        await page.goto(url);

        const currentUrl = page.url();
        check(currentUrl, {
            currentUrl: (h) => h.includes(url),
        });

        const text = await page
            .getByText("Aktuelt")
            .textContent();

        check(text, {
            "Text includes Aktuelt": (h) => h.includes("Aktuelt"),
        });
    }
    catch (error) {
        console.error(`Error opening ${url}:`, error);
    }
    finally {
        await page.close();
    }
}
