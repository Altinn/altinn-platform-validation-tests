import { fail } from "k6";

import { ConnectionsClient, CreateAccessPackageQueryBuilder, CreateConnectionQueryBuilder, CreateResourceRightsQueryBuilder, DeleteConnectionQueryBuilder, GetResourceDelegationCheckQueryBuilder } from "../../../../../../clients/access-management/enduser/connections/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../../../common-imports.js";
import { fetchTestData, getItemFromList, lazy, pickUnique, requireEnv } from "../../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../../scopes.js";
import { CreateAccessPackage, CreateConnection, CreateResourceRights, DeleteConnection, GetResourceDelegationCheck } from "../../../../../building-blocks/access-management/enduser/connections/index.js";

const ENDUSER_SCOPES = CreateScopeString([
    AltinnScopes.PORTAL.ENDUSER,
]);

/**
 * An organization and a person with a role in it, such as its daglig leder,
 * the innehaver of an enkeltpersonforetak or the bostyrer of a konkursbo. Made
 * with testudo, see the README in this folder.
 *
 * @typedef {object} OrganizationRow
 * @property {string} organizationIdentifier Organization number.
 * @property {string} partyUuid Party UUID of the organization.
 * @property {string} personRole The person's role in the organization, for example daglig-leder or bostyrer.
 * @property {string} ssn National identity number of the person.
 * @property {string} userId Altinn user id of the person.
 * @property {string} userPartyId Party id of the person.
 * @property {string} userPartyUuid Party UUID of the person.
 */

/**
 * The client of a regnskapsfører, and the client's leader.
 *
 * @typedef {object} RegnskapsforerClientColumns
 * @property {string} clientOrganizationIdentifier Organization number of the client.
 * @property {string} clientPartyUuid Party UUID of the client.
 * @property {string} clientPersonRole The client leader's role, for example daglig-leder.
 * @property {string} clientSsn National identity number of the client's leader.
 * @property {string} clientUserId Altinn user id of the client's leader.
 * @property {string} clientUserPartyId Party id of the client's leader.
 * @property {string} clientUserPartyUuid Party UUID of the client's leader.
 */

/**
 * A regnskapsfører, its leader (daglig leder, or innehaver of an ENK), one of
 * its clients and the client's leader. Made with testudo, see the README in
 * this folder.
 *
 * @typedef {OrganizationRow & RegnskapsforerClientColumns} RegnskapsforerRow
 */

/**
 * Reads one fixture in this folder for the environment.
 *
 * @param {string} fixture The fixture's folder under delegation-check, for example organizations.
 * @returns {Array<*>} The rows.
 */
function loadFixture(fixture) {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return fetchTestData(`access-management/enduser/connections/delegation-check/${fixture}/${__ENV.ENVIRONMENT}.csv`);
}

/**
 * Setup for the tests that act as the daglig leder of an AS.
 *
 * @returns {{organizations: Array<OrganizationRow>}} AS organizations with their daglig leder.
 */
export function setupOrganizations() {
    return { organizations: loadFixture("organizations") };
}

/**
 * Two organizations where the first has delegated an access package to the
 * second, so the daglig leder of the receiving organization reaches the
 * delegating one through their key role.
 *
 * @typedef {object} KeyRoleConnection
 * @property {OrganizationRow} delegatingOrganization The organization that delegated the access package.
 * @property {OrganizationRow} receivingOrganization The organization that received it.
 */

/**
 * Setup for the tests where the daglig leder reaches a party through a key
 * role. Draws two AS organizations. The daglig leder of the first adds the
 * second as a connection and delegates the access package to it. The run
 * stops if that fails, after removing what was made.
 *
 * @param {string} accessPackage The access package to delegate, for example tilgangsstyrer.
 * @param {{createConnection: {[key: string]: string}, delegatePackage: {[key: string]: string}, deleteConnection: {[key: string]: string}}} labels k6 request labels for the steps.
 * @returns {KeyRoleConnection} The two organizations.
 */
export function setupKeyRoleConnection(accessPackage, labels) {
    const [delegatingOrganization, receivingOrganization] = pickUnique(loadFixture("organizations"), 2);

    return delegateAccessPackage(delegatingOrganization, receivingOrganization, accessPackage, labels);
}

/**
 * Setup for the tests where the leader of a regnskapsfører acts for one of
 * its clients. Draws a regnskapsfører, and the client's leader makes the
 * regnskapsfører tilgangsstyrer for the client. The regnskapsfører role alone
 * does not let the regnskapsfører's leader run the delegation check for the
 * client. The run stops if that fails, after removing what was made.
 *
 * @param {{createConnection: {[key: string]: string}, delegatePackage: {[key: string]: string}, deleteConnection: {[key: string]: string}}} labels k6 request labels for the steps.
 * @returns {KeyRoleConnection} The client as the delegating organization, and the regnskapsfører as the receiving one.
 */
export function setupRegnskapsforerAsTilgangsstyrer(labels) {
    /** @type {RegnskapsforerRow} */
    const regnskapsforer = getItemFromList(loadFixture("regnskapsforere"), true);

    /** @type {OrganizationRow} */
    const client = {
        organizationIdentifier: regnskapsforer.clientOrganizationIdentifier,
        partyUuid: regnskapsforer.clientPartyUuid,
        personRole: regnskapsforer.clientPersonRole,
        ssn: regnskapsforer.clientSsn,
        userId: regnskapsforer.clientUserId,
        userPartyId: regnskapsforer.clientUserPartyId,
        userPartyUuid: regnskapsforer.clientUserPartyUuid,
    };

    return delegateAccessPackage(client, regnskapsforer, "tilgangsstyrer", labels);
}

/**
 * The leader of the delegating organization adds the receiving organization as
 * a connection and delegates the access package to it. The run stops if that
 * fails, after removing what was made.
 *
 * @param {OrganizationRow} delegatingOrganization The organization that delegates.
 * @param {OrganizationRow} receivingOrganization The organization that receives the access package.
 * @param {string} accessPackage The access package to delegate.
 * @param {{createConnection: {[key: string]: string}, delegatePackage: {[key: string]: string}, deleteConnection: {[key: string]: string}}} labels k6 request labels for the steps.
 * @returns {KeyRoleConnection} The two organizations.
 */
function delegateAccessPackage(delegatingOrganization, receivingOrganization, accessPackage, labels) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(delegatingOrganization));

    const connection = CreateConnection(
        connections,
        new CreateConnectionQueryBuilder()
            .withParty(delegatingOrganization.partyUuid)
            .withTo(receivingOrganization.partyUuid)
            .build(),
        null,
        labels.createConnection,
    );

    if (connection === null) {
        fail(`Could not add ${receivingOrganization.organizationIdentifier} as a connection of ${delegatingOrganization.organizationIdentifier}`);
    }

    const assignment = CreateAccessPackage(
        connections,
        new CreateAccessPackageQueryBuilder()
            .withParty(delegatingOrganization.partyUuid)
            .withTo(receivingOrganization.partyUuid)
            .withPackage(accessPackage)
            .build(),
        null,
        labels.delegatePackage,
    );

    if (assignment === null) {
        removeKeyRoleConnection({ delegatingOrganization, receivingOrganization }, labels.deleteConnection);
        fail(`Could not delegate ${accessPackage} from ${delegatingOrganization.organizationIdentifier} to ${receivingOrganization.organizationIdentifier}`);
    }

    return { delegatingOrganization, receivingOrganization };
}

/**
 * Removes the connection setupKeyRoleConnection or
 * setupRegnskapsforerAsTilgangsstyrer made, with the access package on it.
 *
 * @param {KeyRoleConnection} data The two organizations.
 * @param {{[key: string]: string}} label k6 request label for the step.
 * @returns {void}
 */
export function removeKeyRoleConnection(data, label) {
    removeConnection(data.delegatingOrganization, data.receivingOrganization.partyUuid, label);
}

/**
 * The leader of the organization removes its connection to a party, with
 * everything delegated on it.
 *
 * @param {OrganizationRow} organization The organization that made the connection.
 * @param {string} toPartyUuid Party UUID of the party it was made to.
 * @param {{[key: string]: string}} label k6 request label for the step.
 * @returns {void}
 */
function removeConnection(organization, toPartyUuid, label) {
    const { connections, tokenGenerator } = getClients();

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(organization));

    DeleteConnection(
        connections,
        new DeleteConnectionQueryBuilder()
            .withParty(organization.partyUuid)
            .withFrom(organization.partyUuid)
            .withTo(toPartyUuid)
            .withCascade(true)
            .build(),
        label,
    );
}

/**
 * An organization and a person outside it whom its leader has made
 * tilgangsstyrer directly, and given some rights on a resource.
 *
 * @typedef {object} DirectTilgangsstyrer
 * @property {OrganizationRow} organization The organization.
 * @property {PersonRow} person The person who is tilgangsstyrer for it.
 */

/**
 * Setup for the tests where a person outside an organization is its
 * tilgangsstyrer through a direct delegation. Draws an AS and a private
 * person. The daglig leder of the AS adds the person as a connection,
 * delegates tilgangsstyrer to them, and delegates the rights on the resource
 * with the actions. The keys of the rights come from the daglig leder's own
 * resource delegation check, since they are opaque. The run stops if any of
 * it fails, after removing what was made.
 *
 * @param {string} resource The resource identifier, for example tilgangspakke_delegering_ressurs.
 * @param {Array<string>} actions The actions of the rights to delegate, for example read and write.
 * @param {{createConnection: {[key: string]: string}, delegatePackage: {[key: string]: string}, rightKeys: {[key: string]: string}, delegateRights: {[key: string]: string}, deleteConnection: {[key: string]: string}}} labels k6 request labels for the steps.
 * @returns {DirectTilgangsstyrer} The organization and the person.
 */
export function setupDirectTilgangsstyrer(resource, actions, labels) {
    /** @type {OrganizationRow} */
    const organization = getItemFromList(loadFixture("organizations"), true);
    /** @type {PersonRow} */
    const person = getItemFromList(loadFixture("persons"), true);
    const { connections, tokenGenerator } = getClients();

    const giveUp = (/** @type {string} */ reason) => {
        removeConnection(organization, person.partyUuid, labels.deleteConnection);
        fail(`${reason}, from ${organization.organizationIdentifier} to person ${person.userId}`);
    };

    tokenGenerator.setTokenGeneratorOptions(getPersonTokenOpts(organization));

    const connection = CreateConnection(
        connections,
        new CreateConnectionQueryBuilder()
            .withParty(organization.partyUuid)
            .build(),
        { personIdentifier: person.personIdentifier, lastName: person.lastName },
        labels.createConnection,
    );

    if (connection === null) {
        fail(`Could not add person ${person.userId} as a connection of ${organization.organizationIdentifier}`);
    }

    const assignment = CreateAccessPackage(
        connections,
        new CreateAccessPackageQueryBuilder()
            .withParty(organization.partyUuid)
            .withTo(person.partyUuid)
            .withPackage("tilgangsstyrer")
            .build(),
        null,
        labels.delegatePackage,
    );

    if (assignment === null) {
        giveUp("Could not delegate tilgangsstyrer");
    }

    const leaderCheck = GetResourceDelegationCheck(
        connections,
        new GetResourceDelegationCheckQueryBuilder()
            .withParty(organization.partyUuid)
            .withResource(resource)
            .build(),
        labels.rightKeys,
    );

    const keys = (leaderCheck?.rights ?? [])
        .filter((rightCheck) => rightCheck.result === true && actions.includes(rightCheck.right?.action?.value ?? ""))
        .map((rightCheck) => rightCheck.right?.key ?? "");

    if (keys.length !== actions.length) {
        giveUp(`The daglig leder may not delegate all of ${JSON.stringify(actions)} on ${resource}`);
    }

    const delegated = CreateResourceRights(
        connections,
        new CreateResourceRightsQueryBuilder()
            .withParty(organization.partyUuid)
            .withTo(person.partyUuid)
            .withResource(resource)
            .build(),
        { directRightKeys: keys },
        labels.delegateRights,
    );

    if (!delegated) {
        giveUp(`Could not delegate ${JSON.stringify(actions)} on ${resource}`);
    }

    return { organization, person };
}

/**
 * Removes the connection setupDirectTilgangsstyrer made, with everything
 * delegated on it.
 *
 * @param {DirectTilgangsstyrer} data The organization and the person.
 * @param {{[key: string]: string}} label k6 request label for the step.
 * @returns {void}
 */
export function removeDirectTilgangsstyrer(data, label) {
    removeConnection(data.organization, data.person.partyUuid, label);
}

/**
 * Setup for the tests that act as the bostyrer of a konkursbo.
 *
 * @returns {{konkursbo: Array<OrganizationRow>}} Konkursbo with their bostyrer.
 */
export function setupKonkursbo() {
    return { konkursbo: loadFixture("konkursbo") };
}

/**
 * Setup for the tests that act as the innehaver of an enkeltpersonforetak.
 *
 * @returns {{enkeltpersonforetak: Array<OrganizationRow>}} Enkeltpersonforetak with their innehaver.
 */
export function setupEnkeltpersonforetak() {
    return { enkeltpersonforetak: loadFixture("enkeltpersonforetak") };
}

/**
 * Setup for the tests that act as the bestyrende reder of a partsrederi.
 *
 * @returns {{partsrederier: Array<OrganizationRow>}} Partsrederier with their bestyrende reder.
 */
export function setupPartsrederier() {
    return { partsrederier: loadFixture("partsrederier") };
}

/**
 * A private person who can log in, with the person's own party. Made with
 * testudo, see the README in this folder.
 *
 * @typedef {object} PersonRow
 * @property {string} personIdentifier National identity number.
 * @property {string} lastName Last name, as Register has it. Needed to add the person as a connection.
 * @property {string} userId Altinn user id.
 * @property {string} partyId Party id of the person.
 * @property {string} partyUuid Party UUID of the person.
 */

/**
 * Setup for the tests that act as a private person on their own behalf.
 *
 * @returns {{persons: Array<PersonRow>}} Private persons.
 */
export function setupPersons() {
    return { persons: loadFixture("persons") };
}

/**
 * Token options for acting as a private person.
 *
 * @param {PersonRow} row The person the iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getPrivatePersonTokenOpts(row) {
    return getPersonTokenOpts({
        ssn: row.personIdentifier,
        userId: row.userId,
        userPartyId: row.partyId,
        userPartyUuid: row.partyUuid,
    });
}

/**
 * Creates the client and its token generator once per k6 runtime, for nobody
 * in particular. Which end user an iteration acts as is set per row with
 * setTokenGeneratorOptions and getPersonTokenOpts.
 *
 * @returns {{connections: ConnectionsClient, tokenGenerator: PersonalTokenGenerator}} The client and its token generator.
 */
export const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(
        new PersonalTokenBuilder()
            .withScopes(ENDUSER_SCOPES)
            .build(),
    );

    return {
        connections: new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        tokenGenerator,
    };
});

/**
 * Token options for acting as the person in a row. The scopes are repeated,
 * since the options replace the ones the generator was built with.
 *
 * @param {Pick<OrganizationRow, "ssn" | "userId" | "userPartyId" | "userPartyUuid">} row The row whose person the iteration acts as.
 * @returns {*} Options to hand to setTokenGeneratorOptions.
 */
export function getPersonTokenOpts(row) {
    return new PersonalTokenBuilder()
        .withScopes(ENDUSER_SCOPES)
        .withUserId(row.userId)
        .withPartyId(row.userPartyId)
        .withPartyUuid(row.userPartyUuid)
        .withPid(row.ssn)
        .build();
}
