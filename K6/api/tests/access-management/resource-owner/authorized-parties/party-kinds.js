export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Every kind of subject the endpoint accepts resolves to the right parties: a self
// identified user and an ID-porten user registered by email each reach only their own
// party, a rightholder with packages reaches the firm that delegated them, a rightholder
// with nothing reaches an empty list, and a system user reaches the organisation it was
// created for.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Every kind of subject the endpoint accepts resolves to the right parties", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const selfIdentified = data.testdata.a2BrunoSIUser;
        const emailUser = data.testdata.idportenEmailUser;
        const rightholderWithPackages = firm.employee_rightholderWithPackages;
        const rightholderWithoutPackages = firm.employee_rightholderWithoutPackages;
        const systemUser = firm.systemuser_tilgangsstyrer;

        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .build();

        // Looked up by user id, since a self identified user has no national identity number.
        group("A self identified user reaches only its own party", function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(selfIdentified.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [selfIdentified.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyType(parties, selfIdentified.partyUuid, "SelfIdentified");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(parties, selfIdentified.partyUuid);
        });

        // Looked up by user id too, because the endpoint has no email based subject form. The
        // supported forms are person by national identity number, uuid or user name,
        // enterprise user by user name or uuid, organisation by number or uuid, party id, user
        // id and system user uuid. The email address is asserted on the returned party instead.
        group("An email registered user reaches only its own party", function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(emailUser.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [emailUser.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyHasEmailId(parties, emailUser.partyUuid, emailUser.emailId);

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(parties, emailUser.partyUuid);
        });

        group("A rightholder with packages reaches the firm that delegated them", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, firm.partyUuid, [rightholderWithPackages.directPackageToDelegate]);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, firm.partyUuid, firm.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, firm.subunit.partyUuid, [rightholderWithPackages.directPackageToDelegate]);
        });

        group("A rightholder relation on its own authorizes nothing", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithoutPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(parties);
        });

        group("A system user reaches the organisation it was created for", function () {
            const request = new AuthorizedPartiesRequestBuilder().withSystemUser(systemUser.partyUuid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, firm.partyUuid);
        });
    });
}
