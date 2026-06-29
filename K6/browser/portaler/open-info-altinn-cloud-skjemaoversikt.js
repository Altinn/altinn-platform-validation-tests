
import { check } from "k6";
import { browser } from "k6/browser";
import { Trend } from "k6/metrics";

import { expect } from "../../common-imports.js";
import { requireEnv } from "../../helpers.js";
import { getOptions } from "./common.js";

export const options = getOptions();

export function setup() {
    requireEnv(["INFO_CLOUD_URL"]);
    return;
}

export default async function () {
    const url = `${__ENV.INFO_CLOUD_URL}/skjemaoversikt`;
    const page = await browser.newPage();
    try {
        await page.goto(url);

        const currentUrl = page.url();
        check(currentUrl, {
            currentUrl: (h) => h.includes(url),
        });

        const text = await page
            .getByText("Aktuelle skjemaer og tjenester")
            .textContent();

        check(text, {
            "Text includes Aktuelle skjemaer og tjenester": (h) => h.includes("Aktuelle skjemaer og tjenester"),
        });
    }
    catch (error) {
        console.error(`Error opening ${url}:`, error);
    }
    finally {
        await page.close();
    }
}
