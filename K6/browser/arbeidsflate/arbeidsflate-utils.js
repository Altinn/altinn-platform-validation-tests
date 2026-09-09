import { fail } from "k6";
import http from "k6/http";

import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../common-imports.js";
import { lazy } from "../../helpers.js";

export const environment = __ENV.ENVIRONMENT || "yt01";

/**
 * One end user a browser test signs in as.
 *
 * The ids are per environment, so the tests keep their own lists keyed on the
 * environment they run in.
 *
 * @typedef {object} ArbeidsflateEndUser
 * @property {string} pid Person identifier.
 * @property {string} label Label the metrics are tagged with.
 * @property {string} userId Altinn user id.
 * @property {string} partyId Altinn party id.
 * @property {string} partyUuid Party UUID.
 */

/**
 * Creates and caches the token generator the browser tests sign in with.
 *
 * Built once per VU and reused across its iterations. Not built for anyone in
 * particular: which end user a call acts as is decided by getToken swapping the
 * generator options.
 *
 * @returns {PersonalTokenGenerator} The generator.
 */
const getTokenGenerator = lazy(function () {
    return new PersonalTokenGenerator();
});

export const afUrl = (() => {
    switch (environment) {
        case "yt01":
            return "https://af.yt01.altinn.cloud/";
        case "tt02":
            return "https://af.tt02.altinn.no/";
        case "at23":
            return "https://af.at23.altinn.cloud/";
        default:
            return "https://af.yt01.altinn.cloud/";
    }
})();

/**
 * Function to get a cookie object for the given PID.
 *
 * @param {ArbeidsflateEndUser} user - The end user to sign in as.
 * @returns {import("k6/browser").Cookie} - The cookie for the arbeidsflate session.
 */
export function getCookie(user) {
    const token = getToken(user.pid, user.userId, user.partyId, user.partyUuid);
    /** @type {import("k6/browser").Cookie} */
    const cookie = {
        name: "arbeidsflate",
        value: getSessionId(token),
        domain: afUrl
            .replace(/https?:\/\//, "")
            .replace(/http?:\/\//, "")
            .replace(/\/$/, ""), // Remove protocol and trailing slash
        path: "/",
        httpOnly: true,
        secure: false,
        // Lax is what k6 falls back to when the cookie does not say, which is
        // what the empty string this used to send amounted to.
        sameSite: "Lax",
        url: "",
    };
    return cookie;
}

/**
 * Function to get a personal token for a given PID.
 *
 * @param {string} pid - The personal identification number (PID) of the user.
 * @param {string} userId - The Altinn user id of the user.
 * @param {string} partyId - The Altinn party id of the user.
 * @param {string} partyUuid - The party UUID of the user.
 * @returns {string} - The generated personal token.
 **/
function getToken(pid, userId, partyId, partyUuid) {
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes("digdir:dialogporten.noconsent openid altinn:portal/enduser")
        .withPid(pid)
        .withUserId(userId)
        .withPartyId(partyId)
        .withPartyUuid(partyUuid)
        .build();

    const tokenGenerator = getTokenGenerator();

    tokenGenerator.setTokenGeneratorOptions(tokenOpts);

    return tokenGenerator.getToken();
}

/**
 * Function to initialize a session with the given token.
 *
 * @param {string} token - The personal token to initialize the session.
 * @returns {string} The session id to put in the arbeidsflate cookie.
 */
function getSessionId(token) {
    const url = new URL(`${afUrl}/api/init-session`);
    const body = JSON.stringify({
        token: token,
    });
    const params = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "systembruker-k6",
        },
    };
    const resp = http.post(url.toString(), body, params);
    if (resp.status !== 200) {
        // A cookie without a session id opens an anonymous page, which fails
        // later on as something that reads like an unrelated problem.
        fail(`cannot start an arbeidsflate session: init-session returned ${resp.status} ${resp.status_text}`);
    }
    const sessionId = /** @type {{cookie: string}} */ (resp.json()).cookie.split("=")[1]; // Assuming the session ID is the first part of the response body
    return sessionId;
}

/**
 * Async function to wait for the page to load.
 *
 * @param {any} page - The page object to interact with.
 * @param {number} empties - Number of empty checks to perform (default is 1).
 * @returns {Promise<void>} - A promise that resolves when the page is loaded.
 */
export async function waitForPageLoaded(page, empties = 1) {
    const button = page.getByRole("button", {
        name: /Legg til filter|Add filter/
    });

    await button.waitFor({ state: "visible" });

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
