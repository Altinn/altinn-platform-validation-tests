export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: Every kind of subject the endpoint accepts resolves to the right parties
//
//   When the subject is a self identified user, only its own party comes back
//   When the subject is an ID-porten user registered by email, only its own party comes back
//   When the subject is a rightholder with packages, the firm comes back with them
//   When the subject is a rightholder with nothing, the list is empty
//   When the subject is a system user, the organisation it was created for comes back

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: Every kind of subject the endpoint accepts resolves to the right parties", function () {
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
        scenario({
            name: "A self identified user reaches only its own party",
            given: "a self identified user, which has no national identity number",
            when: "a service owner looks that user up by user id",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(selfIdentified.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                parties, [selfIdentified.partyUuid],
                "THEN the user's own party is the only party returned");

            AuthorizedPartiesDomainChecks.CheckPartyType(
                parties, selfIdentified.partyUuid, "SelfIdentified",
                "AND that party is typed as self identified");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(
                parties, selfIdentified.partyUuid,
                "AND it carries no national identity number");
        });

        // Looked up by user id too, because the endpoint has no email based subject form. The
        // supported forms are person by national identity number, uuid or user name,
        // enterprise user by user name or uuid, organisation by number or uuid, party id, user
        // id and system user uuid. The email address is asserted on the returned party instead.
        scenario({
            name: "An email registered user reaches only its own party",
            given: "an ID-porten user registered by email address rather than by national identity number",
            when: "a service owner looks that user up by user id, the endpoint having no email subject form",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(emailUser.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                parties, [emailUser.partyUuid],
                "THEN the user's own party is the only party returned");

            AuthorizedPartiesDomainChecks.CheckPartyHasEmailId(
                parties, emailUser.partyUuid, emailUser.emailId,
                "AND that party carries the email address as its identity");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(
                parties, emailUser.partyUuid,
                "AND it carries no national identity number");
        });

        scenario({
            name: "A rightholder with packages reaches the firm that delegated them",
            given: [
                "a person added as a rightholder of the accounting firm",
                "the firm has delegated an access package to that person",
            ],
            when: "a service owner lists the authorized parties of that person",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, firm.partyUuid, [rightholderWithPackages.directPackageToDelegate],
                "THEN the firm is returned with the packages delegated to that person");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                parties, firm.partyUuid, firm.subunit.partyUuid,
                "AND the firm's subunit is nested under it");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, firm.subunit.partyUuid, [rightholderWithPackages.directPackageToDelegate],
                "AND the firm's subunit inherits the delegated packages");
        });

        scenario({
            name: "A rightholder relation on its own authorizes nothing",
            given: "a person added as a rightholder of the firm but given no access",
            when: "a service owner lists the authorized parties of that person",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithoutPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(
                parties,
                "THEN the party list is empty");
        });

        scenario({
            name: "A system user reaches the organisation it was created for",
            given: "a system user created for the accounting firm and given access packages",
            when: "a service owner looks that system user up by its uuid",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withSystemUser(systemUser.partyUuid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                parties, firm.partyUuid,
                "THEN the organisation the system user was created for is returned");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
                parties, firm.partyUuid,
                "AND it carries the access the system user has been given");
        });
    });
}
