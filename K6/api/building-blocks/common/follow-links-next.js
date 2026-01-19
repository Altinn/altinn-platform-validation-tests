import { expect } from "https://jslib.k6.io/k6chaijs/4.5.0.1/index.js";

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
 * - repeated entries across pages (optional; enabled when `itemKey` is provided)
 *
 * @param {Object} args
 * @param {any} args.firstBody Parsed first-page body
 * @param {(url: string) => import("k6/http").RefinedResponse} args.fetchByUrl Function that fetches the fully qualified next URL
 * @param {string} args.expectedNextBaseUrl Expected prefix for links.next, e.g. `${BASE_URL}/.../bysystem/${systemId}?token=`
 * @param {number} [args.maxPages=20] Safety cap
 * @param {{ label: string, fn: (item: any) => ({ field: string, value: string } | null) }} [args.itemKey] Pair describing how we dedupe entries across pages
 * @param {string} [args.pageLabel="page"] Label prefix for assertion messages
 * @returns {{ pages: number }}
 */
export function followLinksNext({
    firstBody,
    fetchByUrl,
    expectedNextBaseUrl,
    maxPages = 20,
    itemKey,
    pageLabel = "page",
}) {
    let current = firstBody;
    let pages = 1;
    const seenNextUrls = new Set();
    const seenItemKeys = new Set();

    const addItemsToSeenOrFail = (body, pageDescription) => {
        if (!itemKey) return;
        const { label, fn } = itemKey;
        // If the API doesn't return an array, we can't dedupe safely; fail once with a clear message.
        expect(body && Array.isArray(body.data), `${pageDescription}: data must be array for dedupe`).to.equal(true);

        // Avoid noisy per-item assertions: only assert when we actually find a duplicate.
        for (const item of body.data) {
            const keyInfo = fn(item);
            if (!keyInfo || !keyInfo.value) continue;
            const key = keyInfo.value;
            if (seenItemKeys.has(key)) {
                const fullItem = JSON.stringify(item);
                expect(
                    false,
                    `${pageDescription}: Paginated response contains repeated entry (${label}) field=${keyInfo.field} value=${key}; item=${fullItem}`
                ).to.equal(true);
                return;
            }
            seenItemKeys.add(key);
        }
    };

    // Seed with first page, so we can detect "next returns same page" even if URL token changes.
    addItemsToSeenOrFail(current, `${pageLabel} 1`);

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;
        console.log(`[NEXT_URL] ${nextUrl}`);

        expect(nextUrl, "links.next is string").to.be.a("string");
        expect(nextUrl.startsWith("https://"), "links.next starts with https://").to.equal(true);
        expect(nextUrl.startsWith(expectedNextBaseUrl), "links.next matches expected format").to.equal(true);
        expect(seenNextUrls.has(nextUrl), "links.next is repeating").to.equal(false);
        seenNextUrls.add(nextUrl);

        const nextRes = fetchByUrl(nextUrl);
        expect(nextRes.status, `${pageLabel} ${pages + 1} status`).to.equal(200);
        const nextBody = nextRes.json();
        assertHasLinks(nextBody, `${pageLabel} ${pages + 1}`);
        addItemsToSeenOrFail(nextBody, `${pageLabel} ${pages + 1}`);

        current = nextBody;
        pages++;
    }

    return { pages };
}

