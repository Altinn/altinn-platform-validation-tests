import { AppsInstanceDelegationClient } from "../../../../clients/access-management/altinn-apps/index.js";
import { PlatformTokenBuilder, PlatformTokenGenerator } from "../../../../common-imports.js";
import { lazy } from "../../../../helpers.js";

/**
 * The app the delegations are performed by, and the instance they are performed
 * on.
 *
 * The Apps Instance Delegation API works out who is delegating by reading the
 * issuer and the app claim out of the PlatformAccessToken and building
 * app_{issuer}_{app}, which it checks against the resource in the path. So the
 * org and the app are not token trivia, they are the identity performing the
 * delegation, and they have to match the resource.
 *
 * These are the same fixtures Access Management uses in its own Bruno
 * collection. The app has to exist in the environment and the instance has to
 * belong to it, otherwise the delegation check comes back empty.
 */
export const ORG = "ttd";
export const APP = "authz-bruno-instancedelegation";
export const RESOURCE_ID = `app_${ORG}_${APP}`;
export const INSTANCE_ID = "b39a2326-9fff-4414-a209-61e6f9835564";

/**
 * The rights the app is expected to be able to delegate on the instance.
 *
 * Asserted rather than just logged because Access Management's own Bruno suite
 * asserts these exact right keys against the same fixtures, so their pipeline
 * already depends on them holding.
 */
export const EXPECTED_DELEGABLE_RIGHT_KEYS = [
    `${RESOURCE_ID},task_1:read`,
    `${RESOURCE_ID},task_1:sign`,
];

/**
 * Token options for the app that owns the resource.
 *
 * @returns Built platform token options.
 */
export function getAppTokenOpts() {
    return new PlatformTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withOrganization(ORG)
        .withApplication(APP)
        .withTtl(3600)
        .build();
}

/**
 * Creates and caches the client that calls as the app owning the resource.
 *
 * Cached at module scope, so a VU builds it once and keeps the token it fetched
 * rather than refetching on every iteration.
 *
 * @returns {[AppsInstanceDelegationClient, PlatformTokenGenerator]} The client, and the generator behind it.
 */
export const getClients = lazy(function () {
    const appTokenGenerator = new PlatformTokenGenerator(getAppTokenOpts());

    /** @type {[AppsInstanceDelegationClient, PlatformTokenGenerator]} */
    const clients = [
        new AppsInstanceDelegationClient(__ENV.BASE_URL, appTokenGenerator),
        appTokenGenerator,
    ];

    return clients;
});

/**
 * Creates and caches a client whose token carries no app claim at all.
 *
 * A stub generator rather than a PlatformTokenGenerator, since the token
 * generator has no way to hand out an empty token and this is the one case that
 * needs one.
 *
 * @returns {AppsInstanceDelegationClient} A client that sends an empty platform access token.
 */
export function getEmptyTokenClient() {
    return new AppsInstanceDelegationClient(__ENV.BASE_URL, {
        getToken: () => "",
    });
}

/**
 * Creates and caches a client that calls as some other app.
 *
 * Built without org and with the builder's default app, so the performer
 * resolves to app_platform_k6-e2e-tests, which does not own the resource. The
 * token itself is perfectly valid, the identity inside it is the problem.
 *
 * @returns {AppsInstanceDelegationClient} A client calling as an app that owns nothing here.
 */
export const getWrongAppClient = lazy(function () {
    return new AppsInstanceDelegationClient(
        __ENV.BASE_URL,
        new PlatformTokenGenerator(
            new PlatformTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .build(),
        ),
    );
});
