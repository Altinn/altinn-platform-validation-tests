
import { check } from "k6";
import { browser } from "k6/browser";

import { fetchTestData, requireEnv } from "../../helpers.js";
import { getOptions } from "./common.js";

export const options = getOptions();

export function setup() {
    requireEnv(["INFO_CLOUD_URL"]);

    return fetchTestData("portaler/words.txt");
}

export default async function (words) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const encodedWord = encodeURIComponent(randomWord);
    const url = `${__ENV.INFO_CLOUD_URL}/sok/?q=${encodedWord}`;
    const page = await browser.newPage();

    page.on("metric", (metric) => {
        metric.tag({
            name: `${__ENV.INFO_CLOUD_URL}/sok/?q=`,
            matches: [
                {
                    url: /\/sok\/\?q=.*/,
                },
            ],
        });
    });

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
