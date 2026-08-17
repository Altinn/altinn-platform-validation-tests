export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: Every kind of subject the endpoint accepts resolves to the right parties
//
//   When the subject is a self identified user, only its own party comes back
//   When the subject is an ID-porten user registered by email, only its own party comes back
//   When the subject is a rightholder with packages, the firm comes back with them
//   When the subject is a rightholder with nothing, the list is empty
//   When the subject is a system user, the organisation it was created for comes back

export default function (data) {
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

    // WHEN the subject is a self identified user, looked up by user id since such a user
    // has no national identity number, the only party returned is the user's own, typed
    // as self identified.
    group("01 WHEN the subject is a self identified user", function () {
        const request = new AuthorizedPartiesRequestBuilder().withUserId(selfIdentified.userId).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [selfIdentified.partyUuid]);
        AuthorizedPartiesDomainChecks.CheckPartyType(parties, selfIdentified.partyUuid, "SelfIdentified");
        AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(parties, selfIdentified.partyUuid);
    });

    // WHEN the subject is an ID-porten user registered by email address, the only party
    // returned is the user's own, carrying the email identifier as its identity.
    //
    // The lookup is by user id because the endpoint has no email based subject form, so
    // the email address is asserted on the returned party instead.
    group("02 WHEN the subject is an idporten email user", function () {
        const request = new AuthorizedPartiesRequestBuilder().withUserId(emailUser.userId).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [emailUser.partyUuid]);
        AuthorizedPartiesDomainChecks.CheckPartyHasEmailId(parties, emailUser.partyUuid, emailUser.emailId);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoNationalIdentityNumber(parties, emailUser.partyUuid);
    });

    // WHEN the subject is a person who is a rightholder of the accounting firm, the firm
    // is returned with the packages delegated to that person, and the firm's subunit
    // inherits them.
    group("03 WHEN the subject is a rightholder with packages", function () {
        const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithPackages.pid).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid, `the firm ${firm.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, firm.partyUuid, [rightholderWithPackages.directPackageToDelegate]);
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, firm.partyUuid, firm.subunit.partyUuid, `the firm subunit ${firm.subunit.name}`);
        AuthorizedPartiesDomainChecks.CheckSubunitIncludesAccessPackages(parties, firm.subunit.partyUuid, [rightholderWithPackages.directPackageToDelegate]);
    });

    // WHEN the subject is a person who has been added as a rightholder but given nothing,
    // the request succeeds and the party list is empty. A rightholder relation on its own
    // does not make a party authorized.
    group("04 WHEN the subject is a rightholder without packages", function () {
        const request = new AuthorizedPartiesRequestBuilder().withPerson(rightholderWithoutPackages.pid).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(parties, "a rightholder relation on its own authorizes nothing");
    });

    // WHEN the subject is a system user, looked up by its system user uuid, the
    // organisation the system user was created for is returned with the access the system
    // user has been given.
    group("05 WHEN the subject is a system user", function () {
        const request = new AuthorizedPartiesRequestBuilder().withSystemUser(systemUser.partyUuid).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid, `the organisation ${firm.name} the system user was created for`);
        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, firm.partyUuid, "the system user has been given access packages");
    });
}
