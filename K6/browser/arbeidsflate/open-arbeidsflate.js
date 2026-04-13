/**
 * This script is designed to test the performance of opening the "arbeidsflate" page for users with many parties.
 * It uses the K6 browser extension to simulate real user interactions and measure the time taken to load the page.
 * The five worst performing users in the AT23, YT01 and TT02 environments are tested.
 */

import { browser } from "k6/browser";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { getCookie, afUrl, environment } from "./arbeidsflate-utils.js";

const pageLoadingTime = new Trend("page_loading_time", true);

const endUsersByEnvironment = {
    yt01: [
        { pid: "14022216091", label: "a_14022216091_80k", userId: "8897961", partyId: "56850289", partyUuid: "ef7242a0-eaf1-45bb-b898-4a5c17747340" },
        { pid: "21070450361", label: "b_21070450361_47K", userId: "634565", partyId: "51540106", partyUuid: "1251a17d-9dfb-4a1e-b6d9-0c592854fd12" },
        { pid: "10121251049", label: "c_10121251049_30k", userId: "1292822", partyId: "54077221", partyUuid: "2fa5d6a6-40dc-4f45-94d6-ec3a8de92224" },
        { pid: "11111574113", label: "d_11111574113_27k", userId: "1911278", partyId: "54500815", partyUuid: "bdfc5a1c-98a7-4748-b987-88f9821f8f80" },
        { pid: "26091077719", label: "e_26091077719_27k", userId: "975384", partyId: "53838431", partyUuid: "c6d68294-e422-459e-9b83-606da00d39f3" },
    ],
    tt02: [
        { pid: "06095101567", label: "a_06095101567_48k", userId: "70913", partyId: "50022259", partyUuid: "8d31a675-a346-4b63-bd79-8e4d3b5a9b80" },
        { pid: "22877497392", label: "b_22877497392_15k", userId: "157587", partyId: "50956762", partyUuid: "420e98ce-7204-4ae0-b1f5-553df83f6a1f" },
        { pid: "05897398887", label: "c_05897398887_15k", userId: "277373", partyId: "50847099", partyUuid: "3c1c6e2d-a501-4da0-b711-7cd807599395" },
        { pid: "13886499404", label: "d_13886499404_13k", userId: "163193", partyId: "51215792", partyUuid: "ed0cdb8d-6e8b-4fb9-a5a4-29e6b0dbb3c7" },
        { pid: "01055902352", label: "e_01055902352_12k", userId: "70417", partyId: "50001679", partyUuid: "df2770ef-5e6d-43dc-acd4-8097639d0213" },
    ],
    at23: [
        { pid: "22877497392", label: "a_22877497392_15k", userId: "20017189", partyId: "50112177", partyUuid: "64aa2ca5-9ab1-4074-af1d-af30da0fffa6" },
        { pid: "13886499404", label: "b_13886499404_13k", userId: "21049881", partyId: "50684513", partyUuid: "e56acc5a-7269-46f6-99aa-9fdfc12c29c3" },
        { pid: "14836599080", label: "c_14836599080_6k", userId: "20434965", partyId: "50662426", partyUuid: "5c7c3c27-38c1-4c8c-9941-cbd94fb4013f" },
        { pid: "23812849735", label: "d_23812849735_6k", userId: "20504866", partyId: "50690427", partyUuid: "6c01e549-c8f9-4dd8-8510-eb2582e04288" },
        { pid: "24916399592", label: "e_24916399592_6k", userId: "20453748", partyId: "50704586", partyUuid: "60aa45af-e089-4469-8976-ed18b0d9e606" },
    ],
};

/**
 * The setup function is called once before the test starts and is used to prepare the data for the test.
 * It retrieves the users for the current environment, generates cookies for each user, and returns an array of user data.
 * The generated cookies are used to authenticate the users when they access the "arbeidsflate" page during the test,
 * making use of idporten not necessary since the token is generated directly and set as a cookie for the domain.
 * This allows us to simulate real user interactions without needing to go through the login process.
 */
export function setup() {
    const users = endUsersByEnvironment[environment];
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
    for (const enduser of endUsersByEnvironment[environment]) {
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
    const label = endUsersByEnvironment[environment].find(user => user.pid === testData.pid)?.label;
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
        await page.waitForTimeout(2000); // Wait for 1 second before closing the page to ensure all resources are loaded
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
