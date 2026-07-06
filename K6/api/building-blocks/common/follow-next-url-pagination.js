import { check } from "k6";
import http from "k6/http";

/**
 * Extract `links.next` URL from a JSON response body.
 *
 * @param {string|object} body - parsed JSON object
 * @param parsedBody
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
 * @param {string} token
 * @param {string|null} nextUrl Fully qualified URL from `links.next`
 * @param {number} [maxPages=10] Maximum number of pages to fetch
 * @param {Object.<string, string>|null} [labels=null] Extra request tags (e.g. an
 * `action` label) merged into each page request so the paged calls roll up
 * under the same metric/threshold as the first page. The helper's own
 * `name: "next-url"` tag always wins, so continuation-token URLs don't fan out
 * the metrics by name.
 * @returns {number} Number of pages fetched (starting from the provided `nextUrl`)
 */
export function followNextUrlPagination(token, nextUrl, maxPages = 10, labels = null) {
    const seenUrls = new Set();
    let pages = 0;
    let previousBody = null;
    let currentUrl = nextUrl;

    while (currentUrl && pages < maxPages) {
        check(currentUrl, {
            "Pagination URL does not repeat.": () => !seenUrls.has(currentUrl),
        });
        seenUrls.add(currentUrl);

        let tags = { name: "next-url" };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const res = http.get(currentUrl, {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        });

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
