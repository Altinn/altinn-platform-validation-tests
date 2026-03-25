import http from "k6/http";
import { PersonalTokenGenerator } from "../../common-imports.js";

export const environment = __ENV.ENVIRONMENT || "yt01";

let tokenGenerator = undefined

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
 * @param {string} pid - The personal identification number (PID) of the user.
 * @return {Object} - The cookie object containing name, value, domain, path, httpOnly, secure, sameSite, and url.
 * **/
export function getCookie(user) {
    const token = getToken(user.pid, user.userId, user.partyId, user.partyUuid);
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
        sameSite: "",
        url: "",
    };
    return cookie;
}

/**
* Function to get a personal token for a given PID.
* @param {string} pid - The personal identification number (PID) of the user.
* @return {string} - The generated personal token.
**/
function getToken(pid, userId, partyId, partyUuid) {
    const tokenOpts = new Map();
    tokenOpts.set("env", environment);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten.noconsent openid altinn:portal/enduser");
    tokenOpts.set("pid", pid);
    tokenOpts.set("userId", userId);
    tokenOpts.set("partyId", partyId);
    tokenOpts.set("partyuuid", partyUuid);

    if (tokenGenerator == undefined) {
        tokenGenerator = new PersonalTokenGenerator()
    }
    tokenGenerator.setTokenGeneratorOptions(tokenOpts);

    const token = tokenGenerator.getToken();
    return token;
}

/**
 * Function to initialize a session with the given token.
 * @param {F} token - The personal token to initialize the session.
 * @returns sessionId
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
        console.error(resp.status_text);
        return null; // Handle error appropriately
    }
    const sessionId = resp.json().cookie.split("=")[1]; // Assuming the session ID is the first part of the response body
    return sessionId;
}
