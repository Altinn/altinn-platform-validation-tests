import { check } from "k6";

/**
 * Minimal assertion for pagination response shape: only verifies the `links` object
 * (and that `links.next`, if present, is a string).
 *
 * @param {any} body Parsed JSON body
 * @param {string} pageDescription Human-friendly label for assertion messages
 */
export function assertHasLinks(body, pageDescription) {
    check(body, {
        [`${pageDescription}: has links`]: (b) => b && typeof b === "object" && b.links !== undefined,
    });
}

/**
 * Follow `links.next` pagination, printing each next URL, and guarding against:
 * - duplicated next URLs
 *
 * @param {Object} args
 * @param {any} args.firstBody Parsed first-page body
 * @param {(url: string) => import("k6/http").RefinedResponse} args.fetchByUrl Function that fetches the fully qualified next URL
 * @param {string} args.expectedNextBaseUrl Expected prefix for links.next, e.g. `${BASE_URL}/.../bysystem/${systemId}?token=`
 * @param {number} [args.maxPages=20] Safety cap
 * @param {string} [args.pageLabel="page"] Label prefix for assertion messages
 * @returns {{ pages: number }}
 */
export function followLinksNext({
    firstBody,
    fetchByUrl,
    expectedNextBaseUrl,
    maxPages = 20,
    pageLabel = "page",
}) {
    let current = firstBody;
    let pages = 1;
    const seenNextUrls = new Set();

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;
        console.log(`[NEXT_URL] ${nextUrl}`);

        const urlOk = check(nextUrl, {
            "links.next has expected prefix": (u) => typeof u === "string" && u.startsWith(expectedNextBaseUrl),
        });
        if (!urlOk) return { pages };

        const notRepeating = check(seenNextUrls, {
            "links.next is repeating": (set) => !set.has(nextUrl),
        });

        if (!notRepeating) return { pages };
        seenNextUrls.add(nextUrl);

        const nextRes = fetchByUrl(nextUrl);
        const statusOk = check(nextRes, {
            [`${pageLabel} ${pages + 1} status is 200`]: (r) => r.status === 200,
        });
        if (!statusOk) return { pages };

        const nextBody = nextRes.json();
        current = nextBody;
        pages++;
    }

    return { pages };
}

