import { group } from "k6";

import { PartyUrnQueryBuilder } from "../../../clients/register/index.js";
import { requireEnv } from "../../../helpers.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";
import { PartyLookupDomainChecks } from "../../domain-checks/register/party-lookup.js";
import { getLookupClient } from "./commons.js";

const label = { step: "test-lookup-on-idporten-email" };

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "REGISTER_SUBSCRIPTION_KEY"]);
    return;
}

export default function () {
    const registerClient = getLookupClient();

    group("Register: Look up party by idporten email", () => {
        const email = "test@mailinator.com";
        const fields = ["party", "user"];

        const parties = RegisterBuildingBlocks.AccessManagementPartiesQuery(
            registerClient,
            new PartyUrnQueryBuilder().withIdportenEmail(email).build(),
            fields,
            label,
        );

        group(
            "Register: Look up party by idporten email - verify response body",
            () => {
                if (!PartyLookupDomainChecks.CheckSinglePartyFound(parties, `email '${email}'`)) {
                    return;
                }

                const party = parties[0];

                PartyLookupDomainChecks.CheckPartyMatchesIdportenEmail(party, email);
            },
        );
    });
}
