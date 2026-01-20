import { check } from "k6";

/**
 * Follow `links.next` pagination and testing for duplicated next URLs.
 *
 * @param {Object} args
 * @param {any} args.firstBody Parsed first-page body
 * @param {(url: string) => import("k6/http").RefinedResponse} args.fetchByUrl Function that fetches the fully qualified next URL
 * @param {string} args.expectedNextBaseUrl Expected prefix for links.next, e.g. `${BASE_URL}/.../bysystem/${systemId}?token=`
 * @param {number} [args.maxPages=20] Safety cap
 * @returns {number} Number of pages visited (including the first page)
 */
export function followLinksNext({
    firstBody,
    expectedNextBaseUrl,
    fetchByUrl,
    maxPages = 20,
}) {
    let current = firstBody;
    let pages = 1;
    const seenNextUrls = new Set();

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;

        if (
            !check(nextUrl, {
                "links.next has expected prefix": (u) =>
                    typeof u === "string" && u.startsWith(expectedNextBaseUrl),
            })
        )
            return pages;

        const notRepeating = check(seenNextUrls, {
            "links.next is repeating": (set) => !set.has(nextUrl),
        });

        if (!notRepeating) return pages;
        seenNextUrls.add(nextUrl);

        const nextRes = fetchByUrl(nextUrl);
        current = nextRes;
        pages++;
    }
    return pages;
}
