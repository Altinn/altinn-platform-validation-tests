import { CorrespondenceClient } from "../../../clients/correspondence/index.js";
import {
    PersonalTokenBuilder,
    PersonalTokenGenerator,
} from "../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

/**
 * Defaults migrated from the existing Correspondence performance test data.
 * The resource and service owner differ between the regular test environments
 * and YT01.
 */
const TEST_CONFIGURATION = {
    at23: {
        resourceId: "bruno-correspondence",
        serviceOwnerOrgNo: "991825827",
        serviceOwnerRepresentativePid: "20827199746",
    },
    tt02: {
        resourceId: "bruno-correspondence",
        serviceOwnerOrgNo: "991825827",
        serviceOwnerRepresentativePid: "20827199746",
    },
    yt01: {
        resourceId: "ttd-dialogporten-automated-tests-correspondence",
        serviceOwnerOrgNo: "713431400",
        serviceOwnerRepresentativePid: "27080618048",
    },
};

/**
 * Resolves environment-specific Correspondence test identities.
 *
 * The authenticated person represents the service owner. Correspondence then
 * determines the actual sender from the owner of the selected resource in the
 * Resource Registry.
 *
 * @returns {{
 * resourceId: string,
 * recipient: string,
 * serviceOwnerOrgNo: string,
 * serviceOwnerRepresentativePid: string
 * }} Test configuration for the active environment.
 */
export function getCorrespondenceTestConfiguration() {
    const defaults = TEST_CONFIGURATION[__ENV.ENVIRONMENT] ?? {};
    const configuration = {
        resourceId: __ENV.CORRESPONDENCE_RESOURCE_ID ?? defaults.resourceId,
        recipient: __ENV.CORRESPONDENCE_RECIPIENT ?? "14886498226",
        serviceOwnerOrgNo:
            __ENV.CORRESPONDENCE_SENDER_ORG_NO ?? defaults.serviceOwnerOrgNo,
        serviceOwnerRepresentativePid:
            __ENV.CORRESPONDENCE_SENDER_PID ??
            defaults.serviceOwnerRepresentativePid,
    };

    const missing = Object.entries(configuration)
        .filter(([, value]) => value === undefined || value === "")
        .map(([name]) => name);

    if (missing.length > 0) {
        throw new Error(
            `Missing Correspondence test configuration for ${__ENV.ENVIRONMENT}: ${missing.join(", ")}`,
        );
    }

    return configuration;
}

/**
 * Cached once per VU so the token generator can reuse its token.
 *
 * @type {CorrespondenceClient | undefined}
 */
let correspondenceClient = undefined;

/**
 * Creates the client used by a person representing the service owner.
 *
 * Given `altinn:correspondence.write`, which covers initialization.
 *
 * @returns {[CorrespondenceClient]} The correspondence client, as a single-item
 * list so callers can keep destructuring if more clients are added.
 */
export function getClients() {
    if (correspondenceClient === undefined) {
        const configuration = getCorrespondenceTestConfiguration();
        const scopes = CreateScopeString([
            AltinnScopes.CORRESPONDENCE.WRITE,
        ]);

        const serviceOwnerTokenGenerator = new PersonalTokenGenerator(
            new PersonalTokenBuilder()
                .withEnvironment(__ENV.ENVIRONMENT)
                .withTtl(3600)
                .withScopes(scopes)
                .withPid(configuration.serviceOwnerRepresentativePid)
                .withConsumerOrganizationNumber(
                    configuration.serviceOwnerOrgNo,
                )
                .build(),
        );

        correspondenceClient = new CorrespondenceClient(
            __ENV.BASE_URL,
            serviceOwnerTokenGenerator,
        );
    }

    return [correspondenceClient];
}
