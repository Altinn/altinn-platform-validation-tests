import { check } from "k6";

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
 * Follow `links.next` pagination and count pages.
 *
 * @param {Object} args
 * @param {string|object} args.firstBody - First page response body
 * @param {function(string): {body: string, status: number}} args.fetchNextPage - Function to fetch next page by URL
 * @param {number} [args.maxPages=20] - Safety cap to prevent infinite loops
 * @returns {number} - Number of pages visited (including first page)
 */
export function followPagination({ firstBody, fetchNextPage, maxPages = 20 }) {
    let currentBody = firstBody;
    let pages = 1;

    while (pages < maxPages) {
        const nextUrl = extractNextUrl(currentBody);
        if (!nextUrl) break;

        const res = fetchNextPage(nextUrl);

        const ok = check(res, {
            "next page status is 200": (r) => r.status === 200,
            "next page body is not empty": (r) =>
                typeof r.body === "string" && r.body.length > 0,
        });

        if (!ok) {
            console.log(
                `Pagination failed at page ${pages + 1}:`,
                res.status,
                res.body,
            );
            break;
        }
        currentBody = res.body;
        pages++;
    }

    return pages;
}
