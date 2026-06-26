import { check, group } from "k6";
import http from "k6/http";
import { PersonalTokenGenerator } from "../../../common-imports.js";
import { RegisterApiClient } from "../../../clients/authentication/index.js";
import {
    AddRevisorRoleToErForOrg,
    GetRevisorCustomerIdentifiersForParty,
    RemoveRevisorRoleFromEr,
} from "../../building-blocks/register/index.js";
import { retry, parseCsvData, getItemFromList, requireEnv } from "../../../helpers.js";

/**
 * @file add-rm-revisor-role-for-client.js
 * @description Verifies that role changes in ER (Enhetsregisteret / Brønnøysundregisteret)
 * are correctly propagated to Altinn's internal Register component.
 *
 * The test simulates a real-world ER event by removing a revisor role from a client
 * organization via the ER SOAP API, then verifying that Altinn Register reflects the
 * removal. The role is subsequently re-added to leave the system in its original state
 * and verifying that it's present again in the Register
 *
 * @requires ENV.ENVIRONMENT - Target environment (e.g. tt02, yt01, at22, at23)
 * @requires ENV.BASE_URL - Base URL for the Register API
 * @requires ENV.REGISTER_SUBSCRIPTION_KEY - Subscription key for the Register API
 * @requires ENV.SOAP_ER_USERNAME - Username for the ER SOAP API
 * @requires ENV.SOAP_ER_PASSWORD - Password for the ER SOAP API
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
        const options = new Map();
        options.set("env", __ENV.ENVIRONMENT);
        options.set("ttl", 3600);
        options.set("scopes", "altinn:register/partylookup.admin");
        options.set("pid", 22877497392);

        const tokenGenerator = new PersonalTokenGenerator(options);

        const registerApiClient = new RegisterApiClient(
            __ENV.BASE_URL,
            tokenGenerator,
        );

        const facilitatorPartyUuidRevisor = facilitator.partyUuid;
        const facilitatorOrg = facilitator.org;

        const currentOrgs = GetRevisorCustomerIdentifiersForParty(
            registerApiClient,
            facilitatorPartyUuidRevisor,
            __ENV.REGISTER_SUBSCRIPTION_KEY,
        );

        console.log(`Initial number of revisor customers: ${currentOrgs.length}`);

        if (currentOrgs.length === 0) {
            throw new Error("No revisor customers found to test with.");
        }

        const targetOrg = currentOrgs[0];
        console.log(
            `Picked target client organizationIdentifier for test: ${targetOrg}`,
        );

        let res = RemoveRevisorRoleFromEr(
            registerApiClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            targetOrg,
            facilitatorOrg,
        );

        check(res.body, {
            "RemoveRevisorRoleFromEr - Response contains status OK_ER_DATA_PROCESSED":
                (r) => r.includes("status=\"OK_ER_DATA_PROCESSED\""),
        });

        let success = retry(
            () => {
                const orgs = GetRevisorCustomerIdentifiersForParty(
                    registerApiClient,
                    facilitatorPartyUuidRevisor,
                    __ENV.REGISTER_SUBSCRIPTION_KEY,
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

        res = AddRevisorRoleToErForOrg(
            registerApiClient,
            __ENV.SOAP_ER_USERNAME,
            __ENV.SOAP_ER_PASSWORD,
            targetOrg,
            facilitatorOrg,
        );

        var outcome = check(res, {
            //Add check for status code
            "AddRevisorRoleToErForOrg - body is not empty": (r) =>
                r.body && r.body.length > 0,
            "AddRevisorRoleToErForOrg - response contains status OK_ER_DATA_PROCESSED":
                (r) => r.body.includes("status=\"OK_ER_DATA_PROCESSED\""),
        });
        if (!outcome) {
            console.error(res.status);
            console.error(res.body);
        }

        success = retry(
            () => {
                const orgs = GetRevisorCustomerIdentifiersForParty(
                    registerApiClient,
                    facilitatorPartyUuidRevisor,
                    __ENV.REGISTER_SUBSCRIPTION_KEY,
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
