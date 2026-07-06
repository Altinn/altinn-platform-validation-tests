
import { AuthorizedPartiesClient } from "../../../../../clients/authorization/index.js";
import { EnterpriseTokenGenerator, EnterpriseTokenGeneratorOptions } from "../../../../../common-imports.js";
import { getItemFromList, getOptions, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/authorization/authorized-parties/index.js";
import { endUserLabels, endUsers } from "./end-users.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

const orgCodes = [
    //"asf",
    "brg",
    "dfo",
    "digdir",
    //"digitaliseringsdirektoratet",
    "fors",
    //"kmd",
    "mdir",
    "nav",
    "pod",
    "skd",
    "svv",
    "ttd",
];

export const options = getOptions(endUserLabels);

/**
 * @type {AuthorizedPartiesClient | undefined}
 */
let authorizedPartiesClient = undefined;

/**
 * k6 setup function.
 *
 * Validates required environment variables before the test runs.
 *
 * @returns {void}
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client used to interact with the
 * Authorized Parties API.
 *
 * The client uses an enterprise token with the
 * `altinn:accessmanagement/authorizedparties.admin` scope.
 * The same {@link AuthorizedPartiesClient} instance is reused on
 * subsequent calls.
 *
 * @returns {[AuthorizedPartiesClient]} The initialized API client.
 */
function getClients() {
    if (authorizedPartiesClient == undefined) {
        const tokenOpts = new EnterpriseTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.admin");

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);

        authorizedPartiesClient = new AuthorizedPartiesClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [authorizedPartiesClient];
}

export default function () {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(endUsers, randomize);
    const randomizeOrgCodes = true;
    const queryParams = {
        includeAltinn3: "true",
        includeAltinn2: "true",
        includeAccessPackages: "true",
        orgCode: getItemFromList(orgCodes, randomizeOrgCodes),
    };

    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.pid,
        queryParams,
        null,
        { unique_id: userParty.label },
    );
}
