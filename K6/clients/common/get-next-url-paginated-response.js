import { check, fail } from "k6";
import http from "k6/http";

/**
 * Extract `links.next` URL from a JSON response body.
 * @param {string|object} body - JSON string or parsed object
 * @returns {string|null} - The next URL or null if not found
 */
export function extractNextUrl(body) {
    if (body === null || body === undefined) return null;

    try {
        const parsed = typeof body === "string" ? JSON.parse(body) : body;
        return parsed?.links?.next ?? null;
    } catch {
        return null;
    }
}

/**
 * Fetch a fully-qualified `links.next` URL using a bearer token.
 *
 * This is intentionally generic: **only** `token` + `nextUrl`.
 *
 * @param {string} token
 * @param {string} nextUrl Fully qualified URL to fetch (typically from `links.next`)
 * @returns {import("k6/http").RefinedResponse}
 */
export function getNextUrlPaginatedResponse(token, nextUrl) {
    const params = {
        tags: { name: "next-url" },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };

    return http.get(nextUrl, params);
}

/**
 * Follow `links.next` pagination starting at `nextUrl`.
 *
 * Safety:
 * - Caps at 20 pages
 * - Fails fast if it detects a URL loop
 * - Checks that each page body changes (to ensure pagination advances)
 *
 * @param {string} token
 * @param {string|null} nextUrl
 * @returns {number} Number of pages fetched (starting from the provided `nextUrl`)
 */
export function followNextUrlPagination(token, nextUrl) {
    const maxPages = 20;
    const seenUrls = new Set();
    let pages = 0;
    let previousBody = null;
    let currentUrl = nextUrl;

    while (currentUrl && pages < maxPages) {
        if (seenUrls.has(currentUrl)) {
            fail(`Pagination loop detected. URL repeated: ${currentUrl}`);
        }
        seenUrls.add(currentUrl);

        const res = getNextUrlPaginatedResponse(token, currentUrl);

        const ok = check(res, {
            "next page status is 200": (r) => r.status === 200,
            "next page body is not empty": (r) =>
                typeof r.body === "string" && r.body.length > 0,
            "next page returns new body": (r) =>
                previousBody === null || r.body !== previousBody,
        });

        if (!ok) {
            console.log(
                `Pagination failed at page ${pages + 1}: ${res.status} ${res.body}`,
            );
        }

        console.log("Iterated new page");

        previousBody = res.body;
        currentUrl = extractNextUrl(res.body);
        pages++;
    }

    return pages;
}
