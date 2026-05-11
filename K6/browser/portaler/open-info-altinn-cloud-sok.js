
import { browser } from "k6/browser";
import { check } from "k6";
import { getOptions } from "./common.js";
import http from "k6/http";

export const options = getOptions();

export function setup() {
    const response = http.get(
        "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/portaler/words.txt"
    );

    return response.body
        .split("\n")
        .map(w => w.trim())
        .filter(Boolean);
}


export default async function (words) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const encodedWord = encodeURIComponent(randomWord);
    const url = `${__ENV.INFO_CLOUD_URL}/sok/?q=${encodedWord}`;
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
