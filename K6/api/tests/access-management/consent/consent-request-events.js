import { group } from "k6";

import { ConsentRequestEventsQueryBuilder } from "../../../../clients/access-management/consent-enterprise/index.js";
import { randomItem } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { EnterpriseGetConsentRequestEvents } from "../../../building-blocks/access-management/consent-enterprise/index.js";
import { collectNextUrlPages, extractNextUrl } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getConsenteeOrgs, getEventsClient, getEventsTokenOpts } from "./commons.js";

const getConsentRequestEventsLabel = { step: "Get Consent Request Events" };

/**
 * Name the checks report under.
 */
const OPERATION = "EnterpriseGetConsentRequestEvents";

// Safety bound on how many pages to follow per iteration.
const MAX_PAGES = __ENV.MAX_PAGES ? parseInt(__ENV.MAX_PAGES) : 10;

export const options = getOptions([getConsentRequestEventsLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return getConsenteeOrgs(__ENV.ENVIRONMENT);
}

/**
 * Test: consent request events for an organization, and the pagination over them.
 *
 * Events come back oldest first, so following links.next to the end is how the
 * latest events are reached. The organization is drawn per iteration, which is
 * what lets the same script serve as both a smoke test and a load test.
 *
 * @param {any[]} orgs Consentee organizations to read events for.
 */
export default function (orgs) {
    const [eventsClient, eventsTokenGenerator] = getEventsClient();

    const org = randomItem(orgs);

    eventsTokenGenerator.setTokenGeneratorOptions(getEventsTokenOpts(org.orgNo));

    group("As an organization, I can read my consent request events and follow pagination", function () {
        const firstPage = group("Fetch the first page of consent request events", function () {
            // No filters: walk every event the organization has.
            const query = new ConsentRequestEventsQueryBuilder().Build();

            const page = EnterpriseGetConsentRequestEvents(
                eventsClient,
                query,
                getConsentRequestEventsLabel,
            );

            PaginationDomainChecks.CheckPaginatedShape(page, OPERATION);
            PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);

            return page;
        });

        group("Follow the next links on the consent request events", function () {
            const nextUrl = extractNextUrl(firstPage);

            const { pages, repeatedUrl, failedUrl, failedStatus } = nextUrl === null
                ? { pages: [], repeatedUrl: null, failedUrl: null, failedStatus: null }
                : collectNextUrlPages(
                    eventsTokenGenerator.getToken(),
                    nextUrl,
                    MAX_PAGES,
                    getConsentRequestEventsLabel,
                );

            PaginationDomainChecks.CheckNextLinksDoNotRepeat(repeatedUrl, OPERATION);

            // A walk that dies on its last page still returns every page before it,
            // so without this the distinct count below is satisfied by the prefix.
            PaginationDomainChecks.CheckEveryPageLoaded(failedUrl, failedStatus, OPERATION);

            for (const page of pages) {
                PaginationDomainChecks.CheckPaginatedNotEmpty(page, OPERATION);
            }

            // An event carries no id of its own, so the whole record is its identity:
            // the consent request, what happened to it and when. Paging has to reach
            // events the first page did not hold, which counting pages cannot say
            // since a page that repeats the first one still counts.
            const seen = new Set();
            for (const page of [firstPage, ...pages]) {
                for (const item of page?.data ?? []) {
                    seen.add(JSON.stringify(item));
                }
            }

            PaginationDomainChecks.CheckPagesHoldDistinctItems(seen.size, firstPage?.data?.length ?? 0, OPERATION);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
