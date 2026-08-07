import { check, fail, group } from "k6";
import http from "k6/http";

import { CcrCustomerRoles, EnhetsregisteretClient, RegisterClient } from "../../../clients/register/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../common-imports.js";
import { getItemFromList, parseCsvData, requireEnv, retry } from "../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";
import {
    EnhetsregisteretBuildingBlocks,
    RegisterBuildingBlocks,
} from "../../building-blocks/register/index.js";

/**
 * @file add-rm-revisor-role-for-client.js
 * @requires ENV.ENVIRONMENT - Target environment (e.g. tt02, yt01, at22, at23)
 * @requires ENV.BASE_URL - Base URL for the Register API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY - Subscription key for the Register API
 * @requires ENV.SOAP_ER_USERNAME - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD - Password for the ER SOAP API
 * @description Verifies that role changes in ER (Enhetsregisteret / Brønnøysundregisteret)
 * are correctly propagated to Altinn's internal Register component.
 *
 * The test simulates a real-world ER event by removing a revisor role from a client
 * organization via the ER SOAP API, then verifying that Altinn Register reflects the
 * removal. The role is subsequently re-added to leave the system in its original state
 * and verifying that it's present again in the Register
 */

export function setup() {
    requireEnv(
        [
            "BASE_URL", "ENVIRONMENT",
            "REGISTER_SUBSCRIPTION_KEY", "SOAP_ER_PASSWORD", "SOAP_ER_USERNAME"
        ]
    );
    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/register/revisor-facilitator-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } }
    );
    return parseCsvData(res.body);
}

export default function (facilitatorList) {
    const facilitator = getItemFromList(facilitatorList);
    group("Remove org from ER and make sure it's reflected in Register", () => {
        const scopes = CreateScopeString([
            AltinnScopes.REGISTER.PARTYLOOKUP.ADMIN
        ]);
        const options = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .withPid(22877497392)
            .build();

        const tokenGenerator = new PersonalTokenGenerator(options);

        const registerClient = new RegisterClient(
            __ENV.BASE_URL,
            tokenGenerator,
            __ENV.REGISTER_SUBSCRIPTION_KEY,
        );

        const enhetsregisteretClient = new EnhetsregisteretClient(__ENV.BASE_URL);

        const facilitatorPartyUuidRevisor = facilitator.partyUuid;
        const facilitatorOrg = facilitator.org;

        // The customers are organizations, so the organization number is what ER
        // takes and what the assertions below compare on.
        const currentOrgs = customerOrganizationNumbers(
            registerClient,
            facilitatorPartyUuidRevisor,
        );

        console.log(`Initial number of revisor customers: ${currentOrgs.length}`);

        if (currentOrgs.length === 0) {
            fail("cannot continue: no revisor customers found to test with");
        }

        const targetOrg = currentOrgs[0];
        console.log(
            `Picked target client organizationIdentifier for test: ${targetOrg}`,
        );

        EnhetsregisteretBuildingBlocks.RemoveRevisorRoleFromEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            targetOrg,
            facilitatorOrg,
        );

        let success = retry(
            () => {
                const orgs = customerOrganizationNumbers(
                    registerClient,
                    facilitatorPartyUuidRevisor,
                );
                const stillPresent = orgs.includes(targetOrg);
                console.log(
                    `[remove role] Org ${targetOrg} is ${stillPresent ? "still" : "no longer"
                    } in the list (${orgs.length})`,
                );
                return !stillPresent;
            },
            {
                retries: 10,
                intervalSeconds: 20,
                testscenario: "remove revisor role",
            },
        );

        check(success, {
            "Revisor role was successfully removed": (s) => s === true,
        });

        EnhetsregisteretBuildingBlocks.AddRevisorRoleToEr(
            enhetsregisteretClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            targetOrg,
            facilitatorOrg,
        );

        success = retry(
            () => {
                const orgs = customerOrganizationNumbers(
                    registerClient,
                    facilitatorPartyUuidRevisor,
                );
                const nowPresent = orgs.includes(targetOrg);
                console.log(
                    `[add role] Org ${targetOrg} is ${nowPresent ? "now" : "still not"
                    } in the list (${orgs.length})`,
                );
                return nowPresent;
            },
            {
                retries: 10,
                intervalSeconds: 30,
                testscenario: "add revisor role back",
            },
        );

        check(success, {
            "Revisor role was successfully added back": (s) => s === true,
        });
    });
}

/**
 * Organization numbers of the parties that have this facilitator as their revisor.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} facilitatorPartyUuid The revisor party UUID.
 * @returns {Array<string>} Organization numbers, empty when the call failed.
 */
function customerOrganizationNumbers(registerClient, facilitatorPartyUuid) {
    const customers = RegisterBuildingBlocks.GetCustomers(
        registerClient,
        facilitatorPartyUuid,
        CcrCustomerRoles.REVISOR,
    );

    return (customers ?? []).map((customer) => customer.organizationIdentifier);
}
