import { check } from "k6";
import http from "k6/http";

import { requireEnv } from "../../../helpers.js";
import { withRetries } from "../../building-blocks/common/retry.js";

/**
 * Reads one page off info.altinn.cloud and checks that it came back.
 *
 * @param {string} path Path under INFO_CLOUD_URL, starting with a slash.
 * @param {{[x: string]: string}|null} [labels] Optional k6 request tags.
 * @returns {void} Nothing. The checks record what came back.
 */
export function getInfoCloud(path, labels) {
    requireEnv(["INFO_CLOUD_URL"]);
    const endpoint = `${__ENV.INFO_CLOUD_URL}${path}`;
    const params = {
        tags: labels ?? undefined,
    };
    const res = withRetries(() => http.get(endpoint, params), "getInfoCloud");

    const succeed = check(res, {
        "status code is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text == "200 OK",
    });
    if (!succeed) {
        console.log(`Request to ${endpoint} failed.`);
        console.log(res.status);
        console.log(res.body);
    }
}

/**
 * Searches info.altinn.cloud for one word and checks that it came back.
 *
 * @param {string} searchWord The word to search for.
 * @param {{[x: string]: string}|null} [labels] Optional k6 request tags.
 * @returns {void} Nothing. The checks record what came back.
 */
export function searchInfoCloud(searchWord, labels) {
    requireEnv(["INFO_CLOUD_URL"]);
    const encodedWord = encodeURIComponent(searchWord);
    const endpoint = `${__ENV.INFO_CLOUD_URL}${`/sok/?q=${encodedWord}`}`;
    let tags = {
        name: `${__ENV.INFO_CLOUD_URL}/sok/?q=`,
        endpoint: `${__ENV.INFO_CLOUD_URL}/sok/?q=`,
    };

    if (labels != null) {
        tags = { ...labels, ...tags };
    }
    const params = {
        tags: tags
    };
    const res = withRetries(() => http.get(endpoint, params), "searchInfoCloud");

    const succeed = check(res, {
        "status code is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text == "200 OK",
    });
    if (!succeed) {
        console.log(`Request to ${endpoint} failed.`);
        console.log(res.status);
        console.log(res.body);
    }
}
