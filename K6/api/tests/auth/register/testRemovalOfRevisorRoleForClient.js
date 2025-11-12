import { check } from "k6";
import { PersonalTokenGenerator } from "../../../../commonImports.js";
import { RegisterApiClient } from "../../../../clients/auth/index.js";
import {
    RemoveRevisorRoleFromEr,
    AddRevisorRoleToErForOrg,
    GetRevisorCustomerIdentifiersForParty
} from "../../../building_blocks/auth/register/index.js";
import { retry } from "../../../../helpers.js";

export default function () {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);
    options.set("scopes", "altinn:register/partylookup.admin");
    options.set("pid", 22877497392);

    const tokenGenerator
        = new PersonalTokenGenerator(options);

    const registerApiClient
        = new RegisterApiClient(__ENV.BASE_URL, tokenGenerator);

    const facilitatorPartyUuidRevisor = "7c1170ec-8232-4998-a277-0ba224808541";
    const facilitatorOrg = "314239458";
    const currentOrgs = GetRevisorCustomerIdentifiersForParty(registerApiClient, facilitatorPartyUuidRevisor, __ENV.REGISTER_SUBSCRIPTION_KEY);

    console.log(`Initial number of revisor customers: ${currentOrgs.length}`);

    if (currentOrgs.length === 0) {
        throw new Error("No revisor customers found to test with.");
    }

    const targetOrg = currentOrgs[0];
    console.log(
        `Picked target client organizationIdentifier for test: ${targetOrg}`
    );

    let res = RemoveRevisorRoleFromEr(registerApiClient, __ENV.SOAP_ER_USERNAME, __ENV.SOAP_ER_PASSWORD, targetOrg, facilitatorOrg);

    check(res, {
        "RemoveRevisorRoleFromEr - Response contains status OK_ER_DATA_PROCESSED": (r) =>
            r.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    let success = retry(
        () => {
            const orgs = GetRevisorCustomerIdentifiersForParty(registerApiClient, facilitatorPartyUuidRevisor, __ENV.REGISTER_SUBSCRIPTION_KEY);
            const stillPresent = orgs.includes(targetOrg);
            console.log(
                `[remove role] Org ${targetOrg} is ${stillPresent ? "still" : "no longer"
                } in the list (${orgs.length})`
            );
            return !stillPresent;
        },
        {
            retries: 10,
            intervalSeconds: 30,
            testscenario: "remove revisor role",
        }
    );

    check(success, {
        "Revisor role was successfully removed": (s) => s === true,
    });

    res = AddRevisorRoleToErForOrg(registerApiClient, __ENV.SOAP_ER_USERNAME, __ENV.SOAP_ER_PASSWORD, targetOrg, facilitatorOrg);

    check(res, {
        "AddRevisorRoleToErForOrg - response contains status OK_ER_DATA_PROCESSED": (r) =>
            r.includes("status=\"OK_ER_DATA_PROCESSED\""),
    });

    success = retry(
        () => {
            const orgs = GetRevisorCustomerIdentifiersForParty(registerApiClient, facilitatorPartyUuidRevisor, __ENV.REGISTER_SUBSCRIPTION_KEY);
            const nowPresent = orgs.includes(targetOrg);
            console.log(
                `[add role] Org ${targetOrg} is ${nowPresent ? "now" : "still not"
                } in the list (${orgs.length})`
            );
            return nowPresent;
        },
        {
            retries: 10,
            intervalSeconds: 30,
            testscenario: "add revisor role back",
        }
    );

    check(success, {
        "Revisor role was successfully added back": (s) => s === true,
    });
}
