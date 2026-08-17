export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Feature: Every kind of subject the endpoint accepts resolves to the right parties
//
//   When the subject is a self identified user, only its own party comes back
//   When the subject is an ID-porten user registered by email, only its own party comes back
//   When the subject is a rightholder with packages, the firm comes back with them
//   When the subject is a rightholder with nothing, the list is empty
//   When the subject is a system user, the organisation it was created for comes back

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
        group("WHEN the subject is a self identified user", function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(selfIdentified.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                "THEN the user's own party is the only party returned",
                parties, [selfIdentified.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyType(
                "AND that party is typed as self identified",
                parties, selfIdentified.partyUuid, "SelfIdentified");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(
                "AND it carries no national identity number",
                parties, selfIdentified.partyUuid);
        });

        // Looked up by user id too, because the endpoint has no email based subject form. The
        // supported forms are person by national identity number, uuid or user name,
        // enterprise user by user name or uuid, organisation by number or uuid, party id, user
        // id and system user uuid. The email address is asserted on the returned party instead.
        group("WHEN the subject is an ID-porten user registered by email address", function () {
            const request = new AuthorizedPartiesRequestBuilder().withUserId(emailUser.userId).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                "THEN the user's own party is the only party returned",
                parties, [emailUser.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyHasEmailId(
                "AND that party carries the email address as its identity",
                parties, emailUser.partyUuid, emailUser.emailId);

            AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(
                "AND it carries no national identity number",
                parties, emailUser.partyUuid);
        });

        group("WHEN the subject is a person who is a rightholder of the accounting firm", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "THEN the firm is returned with the packages delegated to that person",
                parties, firm.partyUuid, [rightholderWithPackages.directPackageToDelegate]);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND the firm's subunit is nested under it",
                parties, firm.partyUuid, firm.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND the firm's subunit inherits the delegated packages",
                parties, firm.subunit.partyUuid, [rightholderWithPackages.directPackageToDelegate]);
        });

        group("WHEN the subject is a person added as a rightholder but given nothing", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithoutPackages.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(
                "THEN the party list is empty",
                parties);
        });

        group("WHEN the subject is a system user, looked up by its system user uuid", function () {
            const request = new AuthorizedPartiesRequestBuilder().withSystemUser(systemUser.partyUuid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "THEN the organisation the system user was created for is returned",
                parties, firm.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
                "AND it carries the access the system user has been given",
                parties, firm.partyUuid);
        });
    });
}
