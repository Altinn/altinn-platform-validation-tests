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
const allOrganizationsTime = new Trend("all_organizations_time", true);

const endUsersByEnvironment = {
    yt01: [
        { pid: "09856699762", label: "a_09856699762_82_22k", userId: "4543406", partyId: "61711995", partyUuid: "fe2071c7-772b-4210-857e-5f0ff5178fd5" },
        { pid: "21904199173", label: "b_21904199173_74_17k", userId: "4504911", partyId: "61718758", partyUuid: "525c3382-6d62-4479-ac42-319cb67a4c7a" },
        { pid: "06906497962", label: "c_06906497962_76_5k", userId: "4505468", partyId: "61708870", partyUuid: "2ecddbf1-f71d-4f6b-9b11-df8299b09e6f" },
        { pid: "09886998144", label: "d_09886998144_29_11k", userId: "4505692", partyId: "61711678", partyUuid: "92b0865a-efad-41f4-b2c3-06325645d8e0" },
        { pid: "02020434476", label: "e_02020434476_95_64", userId: "622003", partyId: "51870159", partyUuid: "1cd42406-5dfc-4c68-99ef-9bad4d1d60fe" },
        { pid: "15917599510", label: "f_15917599510_36_8k", userId: "4505290", partyId: "61714005", partyUuid: "21bfdebd-6621-459b-91c4-73c9f81c3627" },
        { pid: "12846198901", label: "g_12846198901_44_3k", userId: "4502790", partyId: "61719027", partyUuid: "019b48bd-4a2c-4065-972e-1af57ec0c82b" },
    ],

    tt02: [
        { pid: "27894297765", label: "a_27894297765_98_604", userId: "1247871", partyId: "50795534", partyUuid: "762d1821-621c-4bcd-9290-e947aae80f5e" },
        { pid: "13835898959", label: "b_13835898959_83_1741", userId: "161928", partyId: "51208360", partyUuid: "c7568938-27e5-44a8-a19c-6ad8eb9b7f99" },
        { pid: "01885995329", label: "c_01885995329_71_2281", userId: "162301", partyId: "50587670", partyUuid: "3ee02c28-808c-40c1-9e0a-365b200991be" },
        { pid: "13885898585", label: "e_13885898585_53_2276", userId: "1708808", partyId: "51409240", partyUuid: "391e62ac-bdd0-463e-815a-cfc85fc4bc05" },
        { pid: "14917599581", label: "f_14917599581_44_1101", userId: "277382", partyId: "51204540", partyUuid: "43f31687-4dae-44ea-ab3c-eae127bc1475" },
        { pid: "20819399663", label: "h_20819399663_21_2291", userId: "562673", partyId: "50553719", partyUuid: "44b57209-b8ef-4d93-9610-31de60b0da24" },
        { pid: "24836298396", label: "i_24836298396_19_88", userId: "1270590", partyId: "50976561", partyUuid: "89618bba-89b1-4448-b85b-fe6e318c9bda" },
    ],

    at23: [
        { pid: "27866897323", label: "a_27866897323_96_733", userId: "20416831", partyId: "50468016", partyUuid: "5872e25f-2758-45ef-972f-bc49679582a4" },
        { pid: "03876498730", label: "b_03876498730_64_151", userId: "20046907", partyId: "50685211", partyUuid: "05ee70c7-5037-425b-a5d4-9eb7302aa866" },
        { pid: "06906497962", label: "c_06906497962_49_1719", userId: "20379122", partyId: "50829769", partyUuid: "50182ef4-ef1b-488a-bce8-0979a852e902" },
        { pid: "16836699150", label: "d_16836699150_55_104", userId: "20354080", partyId: "50629281", partyUuid: "4a88341a-cd8f-4ad2-b37f-2cf52029c787" },
        { pid: "10814997575", label: "e_10814997575_30_275", userId: "20091492", partyId: "50339853", partyUuid: "0fd47e4a-f72d-4688-adba-84afc3fca329" },
        { pid: "07906899390", label: "f_07906899390_82_2941", userId: "20331513", partyId: "50232360", partyUuid: "45693921-84ab-488a-9902-4e71e98177d0" },
        { pid: "23817096786", label: "g_23817096786_78_757", userId: "20888815", partyId: "50704586", partyUuid: "c1a0b30c-c320-4fa7-8d12-fb083e75bd4e" },
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
                iterations: 21,
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
        options.thresholds[`page_loading_time{pid_avgivere_dialogs:${enduser.label}}`] = [];
        options.thresholds[`all_organizations_time{pid_avgivere_dialogs:${enduser.label}}`] = [];
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
        pageLoadingTime.add(endTime - startTime, { pid_avgivere_dialogs: label });
        await selectAllEnterprises(page, allOrganizationsTime, { pid_avgivere_dialogs: label });

    }
    catch (error) {
        console.error(`Error opening arbeidsflate for pid ${testData.pid}:`, error);
    }
    finally {
        await page.close();
        await context.close();
    }
}

export async function selectAllEnterprises(page, trend, labels) {
    const startTime = new Date();
    await page.locator('#toolbar-menu-root > button').click();

    try {
        const el = page.locator('#ALL');
        await el.waitFor({ state: 'visible', timeout: 500 });
        await el.click();
    } catch {
        // return without measurement? If #ALL is not present, as this is not a failure of the test scenario
        return;
    }

    await waitForPageLoaded(page, 2);
    const endTime = new Date();
    trend.add(endTime - startTime, labels);
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
