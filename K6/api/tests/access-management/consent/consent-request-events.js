import { fail, group } from "k6";

import { ConsentRequestEventsQueryBuilder } from "../../../../clients/access-management/consent-enterprise/index.js";
import { randomItem } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { EnterpriseGetConsentRequestEvents } from "../../../building-blocks/access-management/consent-enterprise/index.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getConsenteeOrgs, getEventsClient, getEventsTokenOpts } from "./commons.js";

const getConsentRequestEventsLabel = { step: "Get Consent Request Events" };

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

            // Following next links needs a page to follow them from, so a first page
            // that is missing or shaped wrong ends the iteration here rather than
            // failing every check below on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(page, "EnterpriseGetConsentRequestEvents")) {
                fail("cannot follow pagination: the first page of consent request events is not a paginated response");
            }

            PaginationDomainChecks.CheckPaginatedNotEmpty(page, "EnterpriseGetConsentRequestEvents");

            return page;
        });

        group("Follow the next-link pagination", function () {
            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(
                    eventsTokenGenerator.getToken(),
                    nextUrl,
                    MAX_PAGES,
                    getConsentRequestEventsLabel,
                );
            }

            PaginationDomainChecks.CheckMultiplePages(1 + additionalPages, "EnterpriseGetConsentRequestEvents");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
