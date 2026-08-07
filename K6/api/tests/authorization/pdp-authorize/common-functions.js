import http from "k6/http";

import {
    buildXacmlJsonAttributeExternal,
    buildXacmlJsonCategoryExternal,
    buildXacmlJsonRequestExternal,
    buildXacmlJsonRequestRootExternal,
} from "../../../../clients/authorization/v2/builders.js";
import { AuthorizeClient } from "../../../../clients/authorization/v2/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator, randomIntBetween } from "../../../../common-imports.js";
import { getNumberOfVUs, parseCsvData, requireEnv, segmentData } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/**
 * @type {AuthorizeClient | undefined}
 */
let authorizeClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the clients required to interact with the
 * PDP Authorize API.
 *
 * The same {@link AuthorizeClient} and {@link PersonalTokenGenerator}
 * instances are reused across iterations. The token is configured with
 * the `altinn:authorization/authorize.admin` scope, allowing reuse across
 * all users in the test without regenerating per-user tokens.
 *
 * @returns {[
 * AuthorizeClient,
 * PersonalTokenGenerator
 * ]} Tuple containing the Authorize client and token generator.
 */
export function getClients() {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.AUTHORIZATION.AUTHORIZE.ADMIN
        ]);
        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes) // This scope allows the token to be used for all users, so there is no need to generate a token per test user.
            .build();

        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }

    if (authorizeClient == undefined) {
        authorizeClient = new AuthorizeClient(
            __ENV.BASE_URL,
            tokenGenerator,
            __ENV.AUTHORIZATION_SUBSCRIPTION_KEY
        );
    }

    return [authorizeClient, tokenGenerator];
}

/**
 * Function to get token options map.
 *
 * @param {string} ssn - social security number
 * @returns map of token options
 */
export function getTokenOpts(ssn) {
    const scopes = CreateScopeString([
        AltinnScopes.AUTHORIZATION.AUTHORIZE.ADMIN
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes(scopes)
        .withPid(ssn);
    return tokenOpts.build();
}

/**
 * Builds an XACML request asking whether a person may perform an action on a
 * resource belonging to themselves, so the person is both the access subject
 * and the party the resource is looked up for.
 *
 * @param {string} ssn Social security number of the person.
 * @param {string} resourceId Resource, e.g. ttd-dialogporten-performance-test-02.
 * @param {string} action Action, e.g. read, write or sign.
 * @returns {XacmlJsonRequestRootExternal} Authorization request.
 */
export function buildEnduserRequest(ssn, resourceId, action) {
    return buildAuthorizeRequest(action, [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:person:identifier-no",
            value: ssn,
        }),
    ], [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:resource",
            value: resourceId,
        }),
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:person:identifier-no",
            value: ssn,
        }),
    ]);
}

/**
 * Builds an XACML request asking whether a person may perform an action on a
 * resource on behalf of an organization, for instance as its daglig leder.
 *
 * @param {string} ssn Social security number of the person.
 * @param {string} orgno Organization number of the party being acted for.
 * @param {string} resourceId Resource, e.g. ttd-dialogporten-performance-test-02.
 * @param {string} action Action, e.g. read, write or sign.
 * @returns {XacmlJsonRequestRootExternal} Authorization request.
 */
export function buildDaglRequest(ssn, orgno, resourceId, action) {
    return buildAuthorizeRequest(action, [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:person:identifier-no",
            value: ssn,
        }),
    ], [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:resource",
            value: resourceId,
        }),
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:organization:identifier-no",
            value: orgno,
        }),
    ]);
}

/**
 * Builds an XACML request asking whether a person may perform an action on a
 * single instance that another party has delegated to them. Exactly one of
 * fromSsn and fromOrg identifies the delegating party.
 *
 * @param {object} params Request parameters.
 * @param {string} params.toSsn Social security number of the person being given access.
 * @param {string|null} [params.fromSsn] Social security number of the delegating person.
 * @param {string|null} [params.fromOrg] Organization number of the delegating organization.
 * @param {string} params.resourceId Resource, e.g. ttd-dialogporten-performance-test-02.
 * @param {string} params.instanceId Instance, e.g. 56850289/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.
 * @param {string|null} [params.task] Task, e.g. SigningTask_Founders.
 * @param {string} params.action Action, e.g. read, write or sign.
 * @returns {XacmlJsonRequestRootExternal} Authorization request.
 */
export function buildInstanceRequest({
    toSsn,
    fromSsn = null,
    fromOrg = null,
    resourceId,
    instanceId,
    task = null,
    action,
}) {
    const resourceAttributes = [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:resource",
            value: resourceId,
        }),
    ];

    if (fromSsn) {
        resourceAttributes.push(buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:person:identifier-no",
            value: fromSsn,
        }));
    }

    if (fromOrg) {
        resourceAttributes.push(buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:organization:identifier-no",
            value: fromOrg,
        }));
    }

    resourceAttributes.push(buildXacmlJsonAttributeExternal({
        attributeId: "urn:altinn:resource:instance-id",
        value: instanceId,
    }));

    if (task) {
        resourceAttributes.push(buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:task",
            value: task,
        }));
    }

    return buildAuthorizeRequest(action, [
        buildXacmlJsonAttributeExternal({
            attributeId: "urn:altinn:person:identifier-no",
            value: toSsn,
        }),
    ], resourceAttributes);
}

/**
 * Assembles the access subject, action and resource categories into a request
 * root the Authorize API accepts.
 *
 * @param {string} action Action, e.g. read, write or sign.
 * @param {XacmlJsonAttributeExternal[]} subjectAttributes Access subject attributes.
 * @param {XacmlJsonAttributeExternal[]} resourceAttributes Resource attributes.
 * @returns {XacmlJsonRequestRootExternal} Authorization request.
 */
function buildAuthorizeRequest(action, subjectAttributes, resourceAttributes) {
    return buildXacmlJsonRequestRootExternal({
        request: buildXacmlJsonRequestExternal({
            accessSubject: [
                buildXacmlJsonCategoryExternal({
                    attribute: subjectAttributes,
                }),
            ],
            action: [
                buildXacmlJsonCategoryExternal({
                    attribute: [
                        buildXacmlJsonAttributeExternal({
                            attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
                            value: action,
                        }),
                    ],
                }),
            ],
            resource: [
                buildXacmlJsonCategoryExternal({
                    attribute: resourceAttributes,
                }),
            ],
        }),
    });
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% read and write with Permit, 10% sign with NotApplicable.
 *
 * @param {{[key: string]: string}} denyLabel Label used for the requests that are expected to be denied.
 * @param {{[key: string]: string}} permitLabel Label used for the requests that are expected to be permitted.
 * @returns {Array} [action, label, expectedResponse]
 */
export function getActionLabelAndExpectedResponse(denyLabel, permitLabel) {
    const randNumber = randomIntBetween(0, 10);
    switch (randNumber) {
        case 0:
            return ["sign", denyLabel, "NotApplicable"];
        case 1, 3, 5, 7, 9:
            return ["read", permitLabel, "Permit"];
        default:
            return ["write", permitLabel, "Permit"];
    }
}

/**
 * Setup function to segment data for VUs.
 *
 * @returns {object[][]} Organizations with their daglig leder, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-dagl-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } });
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
