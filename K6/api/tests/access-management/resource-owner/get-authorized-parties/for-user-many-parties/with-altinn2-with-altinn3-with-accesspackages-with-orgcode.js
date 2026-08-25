
import { AuthorizedPartiesRequestBuilder } from "../../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties-request.builder.js";
import { AuthorizedPartiesClient, AuthorizedPartiesQueryBuilder } from "../../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../../../common-imports.js";
import { getItemFromList, getOptions, requireEnv } from "../../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../../scopes.js";
import { GetAuthorizedParties } from "../../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
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
        const scopes = CreateScopeString([
            AltinnScopes.ACCESSMANAGEMENT.AUTHORIZEDPARTIES.ADMIN
        ]);
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

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

    const request = new AuthorizedPartiesRequestBuilder()
        .withPerson(userParty.pid)
        .build();

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeAltinn3(true)
        .includeAltinn2(true)
        .includeAccessPackages(true)
        .withOrgCode(getItemFromList(orgCodes, true))
        .build();

    GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        queryParams,
        { unique_id: userParty.label },
    );
}
