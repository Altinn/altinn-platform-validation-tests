import { check } from "k6";
import http from "k6/http";

import { withRetries } from "./retry.js";

/**
 * @typedef {import("../../domain-checks/common/pagination.js").PaginatedResponse} PaginatedResponse
 */

/**
 * Extract `links.next` URL from a JSON response body.
 *
 * @param {{links?: {next?: string|null}|null}|null} parsedBody - parsed JSON object
 * @returns {string|null} - The next URL or null if not found
 */
export function extractNextUrl(parsedBody) {
    return parsedBody?.links?.next ?? null;
}

/**
 * Follow `links.next` pagination starting at `nextUrl`.
 *
 * This helper is intentionally generic: **only** `token` + `nextUrl`.
 * It keeps following `links.next` and ensures each response body changes
 * (to avoid "stuck" pagination) and that URLs don't loop.
 *
 * @param {string} token
 * @param {string|null} nextUrl Fully qualified URL from `links.next`
 * @param {{ maxPages?: number }} [options]
 * @returns {number} Number of pages fetched (starting from the provided `nextUrl`)
 */
/**
 * Follow `links.next` pagination starting at `nextUrl`.
 *
 * This helper is intentionally generic: **only** `token` + `nextUrl`.
 * It keeps following `links.next` and ensures each response body changes
 * (to avoid "stuck" pagination) and that URLs don't loop.
 *
 * @param {string} token TODO: description
 * @param {string|null} nextUrl Fully qualified URL from `links.next`
 * @param {number} [maxPages=10] Maximum number of pages to fetch
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {number} Number of pages fetched (starting from the provided `nextUrl`)
 */
export function followNextUrlPagination(token, nextUrl, maxPages = 10, labels = null) {
    const seenUrls = new Set();
    let pages = 0;
    /** @type {string|null} */
    let previousBody = null;
    let currentUrl = nextUrl;

    while (currentUrl && pages < maxPages) {
        check(currentUrl, {
            "Pagination URL does not repeat.": () => !seenUrls.has(currentUrl),
        });
        seenUrls.add(currentUrl);

        // Bound here so the url the retry closure reads is the narrowed one the
        // loop condition checked.
        const url = currentUrl;

        let tags = { name: "next-url" };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const res = withRetries(
            () => http.get(url, {
                tags: tags,
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-type": "application/json",
                },
            }),
            "followNextUrlPagination",
        );

        const ok = check(res, {
            "Next page status is 200.": (r) => r.status === 200,
            "Next page body is not empty.": (r) =>
                typeof r.body === "string" && r.body.length > 0,
            "Next page returns new values.": (r) =>
                previousBody === null ? true : r.body !== previousBody,
        });

        if (!ok) {
            console.log(res.status, res.status_text);
            console.log(res.body);
            console.log(`Pagination failed at page ${pages + 1} with URL: ${url}`);
            return pages;
        }

        let parsedBody = JSON.parse(res.body);
        previousBody = res.body;
        currentUrl = extractNextUrl(parsedBody);
        if (!currentUrl) {
            console.log("No more pages to fetch");
        }

        if (ok) {
            pages++;
        }
    }

    return pages;
}

/**
 * Follows `links.next` and hands back the pages it read.
 *
 * The sibling above answers how many pages it managed to fetch, which is enough
 * when the only question is whether pagination advances at all. It cannot answer
 * whether the pages hold different items, because it never sees the first page:
 * its "returns new values" check compares each page to the previous one, and on the
 * first hop there is no previous one, so an endpoint that answers the first page
 * over and over is counted as having advanced once.
 *
 * This one asserts nothing and reads nothing out of the pages. It fetches, parses
 * and returns, so the caller can run named checks on the result and a test about
 * pagination depth can say what it actually found.
 *
 * Stops on a URL it has already visited, so an endpoint that hands out the same
 * next link forever ends the walk instead of running to maxPages. The caller sees
 * that in `urls`, which holds every URL fetched, in order.
 *
 * @param {string} token Bearer token for the follow-up requests.
 * @param {string|null} nextUrl Fully qualified URL from `links.next`.
 * @param {number} [maxPages=10] Most pages to fetch.
 * @param {{[x: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {{pages: Array<PaginatedResponse>, urls: string[], repeatedUrl: string|null}} The parsed pages, the URLs fetched, and the URL that ended the walk by repeating, if one did.
 */
export function collectNextUrlPages(token, nextUrl, maxPages = 10, labels = null) {
    /** @type {Array<PaginatedResponse>} */
    const pages = [];

    /** @type {string[]} */
    const urls = [];

    const seenUrls = new Set();
    let currentUrl = nextUrl;

    while (currentUrl && pages.length < maxPages) {
        if (seenUrls.has(currentUrl)) {
            return { pages, urls, repeatedUrl: currentUrl };
        }

        seenUrls.add(currentUrl);

        // Bound so the url the retry closure reads is the narrowed one the loop
        // condition checked.
        const url = currentUrl;

        let tags = { name: "next-url" };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const res = withRetries(
            () => http.get(url, {
                tags: tags,
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-type": "application/json",
                },
            }),
            "collectNextUrlPages",
        );

        if (res.status !== 200 || typeof res.body !== "string" || res.body.length === 0) {
            console.error(`collectNextUrlPages - ${url} answered ${res.status} ${res.status_text}`);
            return { pages, urls, repeatedUrl: null };
        }

        urls.push(url);
        pages.push(JSON.parse(res.body));

        currentUrl = extractNextUrl(pages[pages.length - 1]);
    }

    return { pages, urls, repeatedUrl: null };
}
