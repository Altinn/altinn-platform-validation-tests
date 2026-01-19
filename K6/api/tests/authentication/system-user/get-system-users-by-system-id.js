import { check, group } from "k6";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { GetSystemUsersBySystemId, GetSystemUsersByUrl } from "../../../building-blocks/authentication/system-user/index.js";

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

function normalizeIds(items) {
    if (!Array.isArray(items)) return new Set();
    const ids = items
        .map((x) => (x && (x.id ?? x.systemInternalId)) ?? null)
        .filter((x) => typeof x === "string" && x.length > 0);
    return new Set(ids);
}

function followNextLinks(systemUserApiClient, firstPageBody, expectedBaseUrl, maxPages = 20) {
    let current = firstPageBody;
    let pages = 1;

    while (current && current.links && current.links.next && pages < maxPages) {
        const nextUrl = current.links.next;
        check(nextUrl, {
            "GetSystemUsersBySystemId - links.next starts with https://": (u) => typeof u === "string" && u.startsWith("https://"),
            "GetSystemUsersBySystemId - links.next has expected base url": (u) =>
                typeof u === "string" && u.startsWith(expectedBaseUrl),
            "GetSystemUsersBySystemId - links.next contains token query param": (u) =>
                typeof u === "string" && u.includes("?token="),
        });

        current = GetSystemUsersByUrl(systemUserApiClient, nextUrl);
        pages++;
    }

    return pages;
}

export default function () {
    // Constants for now, could be replaced, but this works in at22 and tt02.
    const systemOwnerOrgNo = "312605031";
    const systemId = "312605031_Virksomhetsbruker"

    const vendorTokenGenerator = getVendorTokenGenerator(systemOwnerOrgNo);
    const systemUserApiClient = new SystemUserApiClient(__ENV.BASE_URL, vendorTokenGenerator);

    group("Get System Users By SystemId (vendor) + pagination", function () {
        // Expected pagination format: .../vendor/bysystem/{systemId}?token=...
        const expectedNextBaseUrl = `${__ENV.BASE_URL}/authentication/api/v1/systemuser/vendor/bysystem/${systemId}?token=`;

        const first = GetSystemUsersBySystemId(systemUserApiClient, systemId);
        check(first, {
            "GetSystemUsersBySystemId - has data array": (b) => b && Array.isArray(b.data),
            "GetSystemUsersBySystemId - has links object": (b) => b && b.links !== undefined,
        });

        // If there is a next link, make sure we can "click" it and that it contains additional entries.
        if (first && first.links && first.links.next) {
            check(first.links.next, {
                "GetSystemUsersBySystemId - links.next matches expected format": (u) =>
                    typeof u === "string" && u.startsWith(expectedNextBaseUrl),
            });
            const second = GetSystemUsersByUrl(systemUserApiClient, first.links.next);
            check(second, {
                "GetSystemUsersBySystemId - second page has data array": (b) => b && Array.isArray(b.data),
                "GetSystemUsersBySystemId - second page has at least 1 item": (b) => b && Array.isArray(b.data) && b.data.length > 0,
            });

            const firstIds = normalizeIds(first.data);
            const secondIds = normalizeIds(second.data);
            const hasNew = Array.from(secondIds).some((id) => !firstIds.has(id));
            check(hasNew, {
                "GetSystemUsersBySystemId - second page contains new entries": (v) => v === true,
            });

            // Continue following until no more pages (or cap hit)
            followNextLinks(systemUserApiClient, second, expectedNextBaseUrl);
        }
    });
}

