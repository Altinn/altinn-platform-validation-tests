/**
 * Load/smoke test for the enterprise consent request events endpoint, walking
 * the full pagination.
 *
 * Picks a random organization from the list of consentee organizations that
 * hold the generated consents (see post-consent.js, which generates them),
 * fetches the first page of consent request events for it and then follows the
 * `links.next` cursor until there are no more pages (bounded by MAX_PAGES).
 *
 * Events are returned oldest-first (ascending by event id), so iterating the
 * pages to the end is how the latest events are reached. Because the
 * organization is chosen per iteration, the same script works both as a smoke
 * test (a few iterations) and as a functional test.
 *
 * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
 * Pagination: cursor based, exposed as a `links.next` URL carrying an opaque
 * `continuationToken`; the page size is server-controlled (not configurable).
 * Response shape: { "links": { "next": <url|null> }, "data": [ ... ] }.
 * Requires an org token with scope ConsentScope.READ.
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
 */

import { check } from "k6";

import {
    ConsentApiClient,
    ConsentRequestEventsQueryBuilder,
} from "../../../../clients/authentication/index.js";
import { randomItem } from "../../../../common-imports.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { ConsentScope } from "../../../../scopes.js";
import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";
import {
    extractNextUrl,
    followNextUrlPagination,
} from "../../../building-blocks/common/follow-next-url-pagination.js";
import {
    getConsenteeOrgs,
    getEnterpriseBaseTokenOpts,
    getEnterpriseTokenOpts,
} from "./consent-commons.js";

const getConsentRequestEventsLabel = { step: "Get Consent Request Events" };

// Safety bound on how many pages to follow per iteration.
const MAX_PAGES = __ENV.MAX_PAGES ? parseInt(__ENV.MAX_PAGES) : 10;

export const options = getOptions([getConsentRequestEventsLabel]);

/**
 * @type {ConsentApiClient | undefined}
 */
let consentApiClient = undefined;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the client used to interact with the consent API.
 *
 * The same {@link EnterpriseTokenGenerator} and
 * {@link ConsentApiClient} instances are reused on subsequent calls.
 * The token generator's organization number is updated per iteration via
 * `setTokenGeneratorOptions`.
 *
 * @returns {[ConsentApiClient]} The initialized consent API client.
 */
function getClients() {
    if (consentApiClient == undefined) {
        tokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.READ)
        );

        consentApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [consentApiClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return getConsenteeOrgs(__ENV.ENVIRONMENT);
}

export default function (orgs) {
    const [consentApiClient] = getClients();

    // Pick a random organization from the list that holds the generated consents.
    const org = randomItem(orgs);
    tokenGenerator.setTokenGeneratorOptions(
        getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.READ)
    );

    // No query parameters: walk every page of events for the organization.
    const queryString =
        new ConsentRequestEventsQueryBuilder()
            .build();

    // Fetch the first page.
    const res = GetConsentRequestEvents(
        consentApiClient,
        queryString,
        getConsentRequestEventsLabel
    );

    let firstPage;
    try {
        check(null, {
            "First page body is valid JSON": () => {
                firstPage = JSON.parse(res.body);
                return true;
            }
        });

    } catch (e) {
        console.log("Unable to parse the response body as JSON");
        console.log(res.body);
        return;
    }

    check(firstPage, {
        "First page has a 'data' field": (b) => b != null && "data" in b,
        "First page has a 'links' field": (b) => b != null && "links" in b,
    });

    // Follow links.next to iterate over the remaining pages. The next URL carries
    // the continuation token (and any filters) so we just keep following it.
    const nextUrl = extractNextUrl(firstPage);
    if (nextUrl) {
        const token = tokenGenerator.getToken();
        const additionalPages = followNextUrlPagination(
            token,
            nextUrl,
            MAX_PAGES,
            getConsentRequestEventsLabel
        );
        check(additionalPages, {
            "Followed at least one additional page": (p) => p >= 1,
        });
    }
}
