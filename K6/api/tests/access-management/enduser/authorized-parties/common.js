import http from "k6/http";

import { AuthorizedPartiesClient } from "../../../../../clients/access-management/enduser/authorized-parties/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";

/** @type {EnterpriseTokenGenerator|null} */
let tokenGenerator = null;

/** @type {AuthorizedPartiesClient|null} */
let authorizedPartiesClient = null;

export function getClients(userId, partyId, partyUuid, pid) {

    if (tokenGenerator == null || authorizedPartiesClient == null) {
        const options = new PersonalTokenBuilder()
            .withScopes(CreateScopeString([
                AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.DEFAULT
            ]))
            .withUserId(userId)
            .withPartyId(partyId)
            .withPartyUuid(partyUuid)
            .withPid(pid)
            .build();

        tokenGenerator
            = new PersonalTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd);
        authorizedPartiesClient
            = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [authorizedPartiesClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    let res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/enduser-get-authorized-parties-bruno-tests/K6/api/tests/access-management/enduser/testdata-${__ENV.ENVIRONMENT}.json`,

        { tags: { action: "fetch-test-data" } },
    );

    const testdata = JSON.parse(res.body);

    res = http.get(
        "https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/enduser-get-authorized-parties-bruno-tests/K6/api/tests/access-management/enduser/shared-testdata.json",
        { tags: { action: "fetch-test-data" } },
    );

    const sharedTestData = JSON.parse(res.body);

    return {
        testdata, sharedTestData
    };
}
