import http from "k6/http";

import { ConnectionsApiClient, MetaApiClient, RequestApiClient } from "../../../../clients/authorization/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData, requireEnv } from "../../../../helpers.js";
import { GetAccessPackagesExport } from "../../../building-blocks/authorization/meta/index.js";

/** @type {PersonalTokenGenerator | undefined} */
let tokenGenerator = undefined;
/** @type {ConnectionsApiClient | undefined} */
let connectionsApiClient = undefined;
/** @type {RequestApiClient | undefined} */
let requestApiClient = undefined;

/**
 * k6 setup function.
 *
 * Fetches the "be om tilgang" test data from the branch on GitHub, and the list
 * of assignable organization access packages from the meta API.
 *
 * Each CSV row holds an organization (Virksomhet) and its daglig leder:
 * pid, partyUuid (daglig leder), orgUuid (Virksomhet), orgNo, lastName.
 *
 * @returns {{ users: Array, packages: string[] }} Test input: parsed CSV rows
 * and the URNs of packages that can be requested (Organisasjon, delegable and
 * assignable).
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/beomtilgang/${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } },
    );

    return { users: parseCsvData(res.body), packages: fetchAssignablePackages() };
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
    const metaApiClient = new MetaApiClient(__ENV.BASE_URL);
    const groups = GetAccessPackagesExport(metaApiClient, { action: "fetch-access-packages" });

    const urns = [];
    for (const group of groups) {
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
 * @returns {[ConnectionsApiClient, RequestApiClient, PersonalTokenGenerator]} TODO: description
 */
export function getClients() {
    if (tokenGenerator === undefined) {
        tokenGenerator = new PersonalTokenGenerator(getEnduserOpts());
    }
    if (connectionsApiClient === undefined) {
        connectionsApiClient = new ConnectionsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (requestApiClient === undefined) {
        requestApiClient = new RequestApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, requestApiClient, tokenGenerator];
}

/**
 * Builds enduser personal-token options for a given user.
 *
 * @param {string=} pid - the user's national identity number
 * @param {string=} partyUuid - the user's party uuid
 * @returns {Map} TODO: description
 */
export function getEnduserOpts(pid = null, partyUuid = null) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    if (pid !== null) {
        tokenOpts.set("pid", pid);
    }
    if (partyUuid !== null) {
        tokenOpts.set("partyuuid", partyUuid);
    }
    return tokenOpts;
}
