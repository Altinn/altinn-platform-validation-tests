import { check, group } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { GetSystemUserRequestsBySystemId, GetSystemUserRequestsByUrl } from "../../../building-blocks/authentication/system-user-request/index.js";

function getVendorTokenGenerator(systemOwnerOrgNo) {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);
    options.set(
        "scopes",
        "altinn:authentication/systemuser.read altinn:authentication/systemuser.request.read altinn:authentication/systemregister.write"
    );
    options.set("orgNo", systemOwnerOrgNo);
    return new EnterpriseTokenGenerator(options);
}

function itemKey(x) {
    if (!x || typeof x !== "object") return "";
    const v = x.id ?? x.requestId ?? x.systemInternalId ?? x.externalRef ?? "";
    return typeof v === "string" ? v : "";
}

function pageFingerprint(body) {
    if (!body || !Array.isArray(body.data)) return "no-data";
    const keys = body.data.map(itemKey).filter((k) => typeof k === "string" && k.length > 0);
    const first = keys[0] ?? "";
    const last = keys[keys.length - 1] ?? "";
    return `len=${body.data.length};first=${first};last=${last}`;
}

function followNextLinks(systemUserRequestApiClient, firstPageBody, expectedBaseUrl, maxPages = 20) {
    let current = firstPageBody;
    let pages = 1;
    const seenNextUrls = new Set();

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;
        const prevFingerprint = pageFingerprint(current);
        check(nextUrl, {
            "GetSystemUserRequestsBySystemId - links.next starts with https://": (u) => typeof u === "string" && u.startsWith("https://"),
            "GetSystemUserRequestsBySystemId - links.next matches expected format": (u) =>
                typeof u === "string" && u.startsWith(expectedBaseUrl),
            "GetSystemUserRequestsBySystemId - links.next is not repeating": (u) => typeof u === "string" && !seenNextUrls.has(u),
        });

console.log(`[NEXT_URL] ${nextUrl}`);


        if (typeof nextUrl === "string") {
            if (seenNextUrls.has(nextUrl)) {
                // Fail-fast: this matches the reported bug where links.next points to the first page every time.
                console.log(`[PAGINATION_BUG] links.next repeated: ${nextUrl}`);
                console.log(`[PAGINATION_BUG] prev page fingerprint: ${prevFingerprint}`);
                break;
            }
            seenNextUrls.add(nextUrl);
        }

        current = GetSystemUserRequestsByUrl(systemUserRequestApiClient, nextUrl);
        const newFingerprint = pageFingerprint(current);
        check([prevFingerprint, newFingerprint], {
            "GetSystemUserRequestsBySystemId - next page differs from previous (fingerprint)": ([a, b]) => a !== b,
        });
        if (prevFingerprint === newFingerprint) {
            console.log(`[PAGINATION_BUG] next page fingerprint did not change for url: ${nextUrl}`);
            console.log(`[PAGINATION_BUG] prev fingerprint: ${prevFingerprint}`);
            console.log(`[PAGINATION_BUG] new  fingerprint: ${newFingerprint}`);
        }
        pages++;
    }

    return pages;
}

export default function () {
    // Constants for now, could be replaced, but this works in at22 and tt02.
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker";

    const vendorTokenGenerator = getVendorTokenGenerator(systemOwnerOrgNo);
    const systemUserRequestApiClient = new SystemUserRequestApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    group("Get System User Requests By SystemId (vendor) + pagination", function () {
        // Expected pagination format: .../vendor/bysystem/{systemId}?token=...
        const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/request/vendor/bysystem/${systemId}?token=`;

        const first = GetSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId);
        check(first, {
            "GetSystemUserRequestsBySystemId - has data array": (b) => b && Array.isArray(b.data),
            "GetSystemUserRequestsBySystemId - has links object": (b) => b && b.links !== undefined,
        });

        if (first && first.links && first.links.next) {
            // "Click" next and ensure it returns a valid page
            const second = GetSystemUserRequestsByUrl(systemUserRequestApiClient, first.links.next);
            check(second, {
                "GetSystemUserRequestsBySystemId - next page has data array": (b) => b && Array.isArray(b.data),
            });
            followNextLinks(systemUserRequestApiClient, second, expectedNextBaseUrl);
        }
    });
}

