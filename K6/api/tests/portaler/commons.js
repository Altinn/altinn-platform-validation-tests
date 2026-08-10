import { check } from "k6";
import http from "k6/http";

import { requireEnv } from "../../../helpers.js";

export function getInfoCloud(path, labels) {
    requireEnv(["INFO_CLOUD_URL"]);
    const endpoint = `${__ENV.INFO_CLOUD_URL}${path}`;
    const params = {
        tags: labels,
    };
    const res = http.get(endpoint, params);

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
    const res = http.get(endpoint, params);

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
