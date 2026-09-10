import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { getItemFromList, getOptions, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { GetMyClients } from "../../../../building-blocks/access-management/enduser/client-delegation/index.js";

// Labels for different actions
const tokenGeneratorLabel = { token_generator: PersonalTokenGenerator.TAGS.getToken.token_generator };

const environment = __ENV.ENVIRONMENT || "yt01";

// Testdata - fetched from yt01, some systemusers with lots of clients, and some regular users with fewer clients
// Note that the testdata is not deterministic, and the number of clients for each user may change over time.
// Add for other environments as needed, but be aware that the testdata may change over time,
// and the test may need to be updated accordingly.
/** @type {{[environment: string]: {uuid: string, label: string}[]}} */
const endUsersByEnvironment = {
    yt01: [
        { uuid: "275d26bf-ad2b-4da6-a872-01828ed2efa1", label: "a_systemuser_78k" },
        { uuid: "e8b458b6-6fa1-46e2-87fb-103ae1b8c100", label: "b_systemuser_52K" },
        { uuid: "438ff2ee-4c48-43df-94df-133a13c281ce", label: "c_systemuser_30k" },
        { uuid: "a364dbe0-b90d-4ee3-85bb-3077c3ec180e", label: "d_systemuser_20k" },
        { uuid: "7533b7af-9a6a-4bb8-b1ea-8732ec903316", label: "e_systemuser_12k" },
        { uuid: "bfb5cc27-6249-4a92-874d-dc610366ff41", label: "f_systemuser_10k" },
        { uuid: "c7c43854-0dc5-4eca-9f3e-b4a8f7d53e61", label: "g_user_1.4k" },
        { uuid: "5246cca4-699e-4e6a-a21d-0163a95b0371", label: "h_user_1.3k" },
    ],
};

const endUsers = endUsersByEnvironment[environment] || [];
const endUserLabels = [...endUsers.map(user => { return { unique_id: user.label }; }), tokenGeneratorLabel]; // TODO: This should be an object, not an array
// get k6 options
export const options = getOptions(endUserLabels);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client and token generator this test reads with.
 *
 * Built once per VU and reused across its iterations. Which end user the run acts
 * as is decided per iteration by swapping the token generator options.
 *
 * @returns {{clientDelegationsApiClient: ClientDelegationClient, tokenGenerator: PersonalTokenGenerator}} The client, and the generator behind it.
 */
const getClients = lazy(function () {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .build();

    const tokenGenerator = new PersonalTokenGenerator(tokenOpts);

    return {
        clientDelegationsApiClient: new ClientDelegationClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * Main function executed by each VU.
 */
export default function () {
    const { clientDelegationsApiClient, tokenGenerator } = getClients();
    const party = getItemFromList(endUsers, false);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.uuid));
    GetMyClients(
        clientDelegationsApiClient,
        null,
        null,
        { unique_id: party.label },
    );
}

/**
 * Builds enduser personal-token options for the given party.
 *
 * @param {string} uuid Party uuid of the end user.
 * @returns map of token options
 */
function getTokenOpts(uuid) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .withScopes(scopes)
        .withPartyUuid(uuid)
        .build();
    return tokenOpts;
}
