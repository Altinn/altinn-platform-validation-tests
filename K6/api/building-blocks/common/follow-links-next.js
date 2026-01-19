import { expect } from "https://jslib.k6.io/k6chaijs/4.5.0.1/index.js";

function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Minimal assertion for pagination response shape: only verifies the `links` object
 * (and that `links.next`, if present, is a string).
 *
 * @param {any} body Parsed JSON body
 * @param {string} pageDescription Human-friendly label for assertion messages
 */
export function assertHasLinks(body, pageDescription) {
    expect(body, `${pageDescription}: links property`).to.have.property("links");
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
    maxPages = 20,
    pageLabel = "page",
}) {
    let current = firstBody;
    let pages = 1;
    const seenNextUrls = new Set();

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;
        console.log(`[NEXT_URL] ${nextUrl}`);

        // If this repeats, stop to avoid infinite looping.
        // Some k6/chai output truncates long assertion messages, so print the full URL on failure.
        if (seenNextUrls.has(nextUrl)) {
            console.log(`[NEXT_URL_REPEAT] ${nextUrl}`);
        }
        expect(seenNextUrls.has(nextUrl), "links.next is repeating: " + nextUrl).to.equal(false);
        seenNextUrls.add(nextUrl);

        const nextRes = fetchByUrl(nextUrl);
        if (nextRes.status !== 200) {
            // Fail with status + body (kept as a string for quick debugging).
            expect.fail(
                `${pageLabel} ${pages + 1} status expected 200, got ${nextRes.status}. Body: ${nextRes.body}`
            );
        }
        const nextBody = nextRes.json();

        current = nextBody;
        pages++;
    }

    return { pages };
}

