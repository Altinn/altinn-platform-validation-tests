
import { ConnectionsClient, } from "../../../../../clients/access-management/enduser/connections/index.js";
import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../common-imports.js";
import { fetchTestData, lazy, requireEnv } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { PackagesExport } from "../../../../building-blocks/access-management/metadata/packages/index.js";

/**
 * One row of the test data: a daglig leder and the organization they lead.
 *
 * @typedef {object} EnduserRow
 * @property {string} pid The daglig leder's national identity number.
 * @property {string} partyUuid The daglig leder's party uuid.
 * @property {string} orgUuid The organization's party uuid.
 * @property {string} orgNo The organization number.
 * @property {string} lastName The daglig leder's last name.
 * @property {string} [userId] The daglig leder's Altinn user id; empty or missing where the file lacks it.
 * @property {string} [partyId] The daglig leder's party id; empty or missing where the file lacks it.
 */

/**
 * k6 setup function.
 *
 * Fetches the "be om tilgang" test data from the branch on GitHub, and the list
 * of assignable organization access packages from the meta API.
 *
 * Each CSV row holds an organization (Virksomhet) and its daglig leder:
 * pid, partyUuid (daglig leder), orgUuid (Virksomhet), orgNo, lastName, and
 * the daglig leder's userId and partyId where the file has them.
 *
 * @returns {{ users: EnduserRow[], packages: string[] }} Test input: parsed CSV rows
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
 * userId and partyId become the urn:altinn:userid and urn:altinn:partyid
 * claims. The decision point in at22 does not recognize a person acting for
 * themselves without them, so the request in step 2 got 403. A row without the
 * columns gets a token without the claims, as before.
 *
 * @param {EnduserRow|null} [user] - the CSV row of the user, or null for a token without a user
 * @returns Token generator options for the given user.
 */
export function getEnduserOpts(user = null) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes(scopes);

    if (user === null) {
        return tokenOpts.build();
    }

    tokenOpts.withPid(user.pid).withPartyUuid(user.partyUuid);
    if (user.userId) {
        tokenOpts.withUserId(user.userId);
    }
    if (user.partyId) {
        tokenOpts.withPartyId(user.partyId);
    }
    return tokenOpts.build();
}
