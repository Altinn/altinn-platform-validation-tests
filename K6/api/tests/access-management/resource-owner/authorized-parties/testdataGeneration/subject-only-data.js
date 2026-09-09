import { fail } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { CcrHolderRoles } from "../../../../../../clients/register/types.js";
import { fetchTestData, requireEnv } from "../../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { RegisterBuildingBlocks } from "../../../../../building-blocks/register/index.js";
import { getPartyLookupAdminClient } from "../../../../register/commons.js";
import { getClients } from "../common.js";

// Generates the rows authorization-boundaries.js and org-code-filter.js read, one file
// per environment.
//
// Neither scenario is about the subject. One is about which credentials the policy
// accepts and the other about which org code a caller may name, and both send the same
// lookup with every credential they try. The subject only has to be one the endpoint
// answers about at all, so all these rows need is a person the lookup succeeds for.
//
// The two files hold different people even so. Ten rows that are the same ten people in
// both files would mean a fixture problem in one scenario silently being a fixture problem
// in the other, and there are enough daglig ledere in these environments to keep them apart.

/**
 * How many rows to emit per scenario.
 */
const ROWS = __ENV.ROWS ? parseInt(__ENV.ROWS) : 10;

export const options = {
    setupTimeout: "600s",
    vus: 1,
    iterations: 1,
};

/**
 * Collects the people to try.
 *
 * @returns {Array<string>} National identity numbers, without duplicates.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "REGISTER_SUBSCRIPTION_KEY"]);

    const adminClient = getPartyLookupAdminClient();

    const organizations = fetchTestData(`register/organizations-${__ENV.ENVIRONMENT}.csv`);

    /** @type {Array<string>} */
    const pids = [];

    for (const organization of organizations) {
        const holders = RegisterBuildingBlocks.GetRoleHolders(
            adminClient,
            organization.organizationUuid,
            CcrHolderRoles.DAGLIG_LEDER,
            ["identifiers", "party", "person"],
        );

        const pid = (holders ?? []).map((holder) => holder.personIdentifier).find((p) => p !== undefined);

        if (pid !== undefined && !pids.includes(pid)) {
            pids.push(pid);
        }
    }

    if (pids.length < 2 * ROWS) {
        console.log(`Only ${pids.length} distinct people found, and ${2 * ROWS} are needed to keep the two files apart`);
    }

    return pids;
}

/**
 * Keeps the people the endpoint answers about, and splits them between the two scenarios.
 *
 * @param {Array<string>} pids The people collected in setup.
 */
export default function (pids) {
    const [authorizedPartiesClient] = getClients();

    const queryParams = new AuthorizedPartiesQueryBuilder().build();

    /** @type {Array<string>} */
    const answered = [];

    for (const pid of pids) {
        if (answered.length === 2 * ROWS) {
            break;
        }

        // A party array is all either scenario needs, empty or not: they assert on the
        // status of the answer, not on what is in it. The building block's own check is
        // what catches a lookup that did not answer at all.
        const parties = GetAuthorizedParties(
            authorizedPartiesClient,
            new AuthorizedPartiesRequestBuilder().withPerson(pid).build(),
            queryParams,
        );

        if (Array.isArray(parties)) {
            answered.push(pid);
        }
    }

    if (answered.length === 0) {
        fail("cannot continue: the endpoint answered about nobody");
    }

    // The first half to one scenario and the second to the other, so a person never appears
    // in both files. With fewer than twenty people the split is uneven rather than
    // overlapping, and the shorter file is the honest answer to what the environment holds.
    printCsv("authorization-boundaries", answered.slice(0, ROWS));
    printCsv("org-code-filter", answered.slice(ROWS, 2 * ROWS));
}

/**
 * Prints one scenario's rows.
 *
 * The output is copied into
 * K6/testdata/access-management/resource-owner/authorized-parties/<scenario>/<env>.csv by
 * hand, since a k6 run cannot write back to the repo.
 *
 * @param {string} scenario The scenario the rows belong to.
 * @param {Array<string>} pids The people to write.
 */
function printCsv(scenario, pids) {
    let csv = "pid\n";

    pids.forEach((pid) => {
        csv += `${pid}\n`;
    });

    console.log(`\n=== ${scenario} (${pids.length} row(s)) ===\n${csv}`);
}
