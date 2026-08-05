import { group } from "k6";

import { ConsentRequestEventsQueryBuilder } from "../../../../clients/access-management/consent-enterprise/index.js";
import { randomItem } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { EnterpriseGetConsentRequestEvents } from "../../../building-blocks/access-management/consent-enterprise/index.js";
import { extractNextUrl, followNextUrlPagination } from "../../../building-blocks/common/follow-next-url-pagination.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { getConsenteeClient, getConsenteeOrgs, getConsenteeTokenOpts } from "./commons.js";

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
 * @param {object[]} orgs Consentee organizations to read events for.
 */
export default function (orgs) {
    const [consenteeClient, consenteeTokenGenerator] = getConsenteeClient();

    const org = randomItem(orgs);

    consenteeTokenGenerator.setTokenGeneratorOptions(getConsenteeTokenOpts(org.orgNo));

    group("As an organization, I can read my consent request events and follow pagination", function () {
        let firstPage;

        group("Fetch the first page of consent request events", function () {
            // No filters: walk every event the organization has.
            const query = new ConsentRequestEventsQueryBuilder().Build();

            firstPage = EnterpriseGetConsentRequestEvents(
                consenteeClient,
                query,
                getConsentRequestEventsLabel,
            );

            PaginationDomainChecks.CheckPaginatedShape(firstPage, "EnterpriseGetConsentRequestEvents");
            PaginationDomainChecks.CheckPaginatedNotEmpty(firstPage, "EnterpriseGetConsentRequestEvents");
        });

        group("Follow the next-link pagination", function () {
            const nextUrl = extractNextUrl(firstPage);

            let additionalPages = 0;
            if (nextUrl !== null) {
                additionalPages = followNextUrlPagination(
                    consenteeTokenGenerator.getToken(),
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
