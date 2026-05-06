/**
 * This script is designed to test the performance of opening the "arbeidsflate" page for users with many parties.
 * It uses the K6 browser extension to simulate real user interactions and measure the time taken to load the page.
 * The five worst performing users in the AT23, YT01 and TT02 environments are tested.
 */

import { browser } from "k6/browser";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { getCookie, afUrl, environment } from "./arbeidsflate-utils.js";
import http from "k6/http";
import { parseCsvData, segmentData, getItemFromList } from "../../helpers.js";

const pageLoadingTime = new Trend("page_loading_time", true);

let users = undefined;

/**
 * The setup function is called once before the test starts and is used to prepare the data for the test.
 * It retrieves the users for the current environment, generates cookies for each user, and returns an array of user data.
 * The generated cookies are used to authenticate the users when they access the "arbeidsflate" page during the test,
 * making use of idporten not necessary since the token is generated directly and set as a cookie for the domain.
 * This allows us to simulate real user interactions without needing to go through the login process.
 */
export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/arbeidsflate/${__ENV.ENVIRONMENT}/users-with-many-parties.csv`);
    users = parseCsvData(res.body);
    const data = [];
    for (const user of users) {
        const cookie = getCookie(user);
        data.push({
            pid: user.pid,
            label: user.label,
            cookie: cookie,
        });
    }
    return data;
}

/**
 * A simple options object making the test run three iterations for each user,
 * using only one virtual user (VU) to simulate the interactions sequentially.
 */
export const options = getOptions();

function getOptions() {

    const options = {
        scenarios: {
            ui: {
                executor: "shared-iterations",
                vus: 1,
                iterations: 15,
                options: {
                    browser: {
                        type: "chromium",
                    },
                },
            },
        },
        thresholds: {},
    };

    // Set labels with empty arrays to collect stats.
    for (const enduser of users) {
        options.thresholds[`page_loading_time{pid_avgivere:${enduser.label}}`] = [];
    }
    return options;
}

/**
 * The default function is the main entry point for the test and is called for each iteration.
 * @param {} data
 */
export default async function (data) {
    const testData = data[__ITER % data.length];
    const label = users.find(user => user.pid === testData.pid)?.label;
    const context = await browser.newContext();
    const page = await context.newPage();
    let startTime;
    let endTime;

    try {
        await context.addCookies([testData.cookie]);
        startTime = new Date();
        await page.goto(afUrl + "?mock=true"); // The mock is to avoid a popup telling about the new arbeidsflate

        // Check if we are on the right page
        const currentUrl = page.url();
        check(currentUrl, {
            currentUrl: (h) => h.includes(afUrl),
        });
        // Wait for the page to load
        await waitForPageLoaded(page);
        endTime = new Date();
        pageLoadingTime.add(endTime - startTime, { pid_avgivere: label });
    }
    catch (error) {
        console.error(`Error opening arbeidsflate for pid ${testData.pid}:`, error);
    }
    finally {
        await page.close();
        await context.close();
    }
}

/**
 * Async function to wait for the page to load.
 * @param {object} page - The page object to interact with.
 * @param {number} empties - Number of empty checks to perform (default is 1).
 * @return {Promise<void>} - A promise that resolves when the page is loaded.
 */
export async function waitForPageLoaded(page, empties = 1) {
    let busyItems = await page.$$("li [aria-busy=\"true\"]");
    let noEmptys = 0;
    while (busyItems.length > 0 || noEmptys < empties) {
        await page.waitForTimeout(10); // Wait for 10 ms before checking again
        busyItems = await page.$$("li [aria-busy=\"true\"]");
        if (busyItems.length === 0) {
            noEmptys++;
        }
    }
}
