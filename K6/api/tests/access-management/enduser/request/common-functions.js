
import { ConnectionsClient, } from "../../../../../clients/access-management/enduser/connections/index.js";
import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { PackagesExport } from "../../../../building-blocks/access-management/metadata/packages/index.js";

/**
 * k6 setup function.
 *
 * Fetches the "be om tilgang" test data from the branch on GitHub, and the list
 * of assignable organization access packages from the meta API.
 *
 * Each CSV row holds an organization (Virksomhet) and its daglig leder:
 * pid, partyUuid (daglig leder), orgUuid (Virksomhet), orgNo, lastName.
 *
 * @returns {{ users: any[], packages: string[] }} Test input: parsed CSV rows
 * and the URNs of packages that can be requested (Organisasjon, delegable and
 * assignable).
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return {
        users: fetchTestData(`access-management/enduser/request/${__ENV.ENVIRONMENT}.csv`),
        packages: fetchAssignablePackages()
    };
}

/**
 * Access packages that pass the delegable/assignable filter but cannot actually
 * be requested in this flow, so they are excluded from the random selection.
 */
const EXCLUDED_PACKAGES = [
    // Krever bobestyrer-rolle, så den kan ikke bes om i denne flyten.
    "urn:altinn:accesspackage:konkursbo-lesetilgang",
    "urn:altinn:accesspackage:konkursbo-skrivetilgang",
    // Kun relevant for NUF (norskregistrert utenlandsk foretak), så den kan ikke bes om her.
    "urn:altinn:accesspackage:tjenester-nuf",
];

/**
 * Fetches the access package catalogue from the meta API and returns the URNs of
 * packages that can be requested: those in an "Organisasjon" group that are both
 * delegable and assignable, minus {@link EXCLUDED_PACKAGES}.
 *
 * @returns {string[]} valid access package URNs
 */
function fetchAssignablePackages() {
    const metaApiClient = new PackagesClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(getEnduserOpts()),
    );
    const groups = PackagesExport(metaApiClient, { action: "fetch-access-packages" });

    const urns = [];
    for (const group of groups ?? []) {
        if (group.type !== "Organisasjon") continue;
        for (const area of group.areas ?? []) {
            for (const pkg of area.packages ?? []) {
                if (pkg.isDelegable && pkg.isAssignable && pkg.urn && !EXCLUDED_PACKAGES.includes(pkg.urn)) {
                    urns.push(pkg.urn);
                }
            }
        }
    }
    return urns;
}

/**
 * Creates and caches the token generator and API clients. The same
 * {@link PersonalTokenGenerator} instance is reused and reconfigured per user
 * via {@link setEnduserOpts}, so all clients pick up the active user's token.
 *
 * @returns {[ConnectionsClient, RequestClient, PersonalTokenGenerator]} Tuple
 * containing the Connections client, the Request client and the token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(getEnduserOpts());

    /** @type {[ConnectionsClient, RequestClient, PersonalTokenGenerator]} */
    const clients = [
        new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        new RequestClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    ];

    return clients;
});

/**
 * Builds enduser personal-token options for a given user.
 *
 * @param {string|null} [pid] - the user's national identity number
 * @param {string|null} [partyUuid] - the user's party uuid
 * @returns Token generator options for the given user.
 */
export function getEnduserOpts(pid = null, partyUuid = null) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes(scopes);

    if (pid !== null) {
        tokenOpts.withPid(pid);
    }
    if (partyUuid !== null) {
        tokenOpts.withPartyUuid(partyUuid);
    }
    return tokenOpts.build();
}
