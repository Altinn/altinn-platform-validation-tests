export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { ClientsAndKeyRolePartiesSetupData } from "./setup-data.types.js";

// A service owner lists the authorized parties of an accounting firm's daily leader.
// The response is a bare array of parties, each carrying the full set of party fields.
// The firm itself appears as a key role party with its subunit, the client organisations
// appear with the packages held through the accountant role, the owner of a sole
// proprietorship client appears as a person party, and no party appears twice.

// The packages an accountant holds on its clients. Hardcoded rather than kept in the
// fixture, matching how the enduser suite keeps delegated access in the tests. The
// generator picks the client on this same list, so a change here has to be made there too.
const ACCOUNTANT_PACKAGES = [
    "regnskapsforer-lonn",
    "regnskapsforer-med-signeringsrettighet",
    "regnskapsforer-uten-signeringsrettighet",
];

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {ClientsAndKeyRolePartiesSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("A service owner lists the authorized parties of an accounting firm's daily leader", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.clientsAndKeyRoleParties, randomize);

        const request = new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeResources()
            .includeInstances()
            .build();

        // Every outcome below is observed on one lookup, so the request is made once rather
        // than repeated per assertion the way the Bruno steps did.
        group("An accounting firm's daily leader reaches the firm, its clients and their owners", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            AuthorizedPartiesDomainChecks.CheckEveryPartyMatchesContract(parties);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, row.firmPartyUuid, row.orgno);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, row.firmPartyUuid, row.firmSubunitPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, row.clientPartyUuid, row.clientOrgno);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, row.clientPartyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, row.clientPartyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, row.clientPartyUuid, row.clientSubunitPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, row.clientSubunitPartyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyType(parties, row.innehaverPartyUuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, row.innehaverPartyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * @returns {ClientsAndKeyRolePartiesSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        clientsAndKeyRoleParties: fetchTestData(`access-management/resource-owner/authorized-parties/clients-and-key-role-parties/${__ENV.ENVIRONMENT}.csv`),
    };
}
