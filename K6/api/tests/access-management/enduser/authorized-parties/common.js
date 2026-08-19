import http from "k6/http";

import { AuthorizedPartiesClient } from "../../../../../clients/access-management/enduser/authorized-parties/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, requireEnv } from "../../../../../helpers.js";
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
            = new PersonalTokenGenerator(options);
        authorizedPartiesClient
            = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [authorizedPartiesClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const testdata = fetchTestData(`access-management/enduser/testdata-${__ENV.ENVIRONMENT}.json`);
    const sharedTestData = fetchTestData(`access-management/enduser/shared-testdata.json`);

    return {
        testdata, sharedTestData
    };
}
