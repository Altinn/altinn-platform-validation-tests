import { GetMyClients } from "../../../building-blocks/authentication/client-delegations/index.js";
import { ClientDelegationsApiClient } from "../../../../clients/authentication/client-delegations.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";

// Labels for different actions
const tokenGeneratorLabel = "Personal Token Generator";

const environment = __ENV.ENVIRONMENT || "yt01";

// Testdata - fetched from yt01, some systemusers with lots of clients, and some regular users with fewer clients
// Note that the testdata is not deterministic, and the number of clients for each user may change over time.
// Add for other environments as needed, but be aware that the testdata may change over time,
// and the test may need to be updated accordingly.
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
const endUserLabels = [...endUsers.map(user => { unique_id: user.label; }), tokenGeneratorLabel];
let tokenGenerator = undefined;
let clientDelegationsApiClient = undefined;


// get k6 options
export const options = getOptions(endUserLabels);

/**
 * Main function executed by each VU.
 */
export default function () {
    if (tokenGenerator === undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", environment);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:portal/enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (clientDelegationsApiClient === undefined) {
        clientDelegationsApiClient = new ClientDelegationsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    const party = getItemFromList(endUsers, false);
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.uuid));
    GetMyClients(
        clientDelegationsApiClient,
        party.label,
    );
}

function getTokenOpts(uuid) {
    const tokenOpts = new Map();
    tokenOpts.set("env", environment);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    tokenOpts.set("partyuuid", uuid);
    return tokenOpts;
}
