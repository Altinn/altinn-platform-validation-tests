import http from "k6/http";

/**
 * Fetch a fully-qualified `links.next` URL (or equivalent) using a tokenGenerator-based bearer token.
 *
 * @param {Object} args
 * @param {string} args.url Fully qualified URL to fetch (typically from `links.next`)
 * @param {*} args.tokenGenerator Must implement `getToken()`
 * @param {string} args.tagName k6 http tag name
 * @returns {import("k6/http").RefinedResponse}
 */
export function getNextUrlPaginatedResponse({ url, tokenGenerator, tagName, logUrl = false }) {
    const token = tokenGenerator.getToken();
    const params = {
        tags: { name: tagName },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };

    return http.get(url, params);
}

