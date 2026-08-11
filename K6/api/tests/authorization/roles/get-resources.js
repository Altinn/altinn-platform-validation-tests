import { RolesClient } from "../../../../clients/access-management/metadata/roles/index.js";
import { PersonalTokenBuilder, PersonalTokenGenerator } from "../../../../common-imports.js";
import { getOptions } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { MetadataBuildingBlocks } from "../../../building-blocks/access-management/metadata/index.js";

const labels = { step: "getRoles" };

/**
 * @type {RolesClient | undefined}
 */
let rolesApiClient = undefined;

/**
 * @type {PersonalTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

export const options = getOptions([labels]);

/**
 * k6 setup function.
 *
 * Validates required environment variables before the test starts.
 *
 * @returns {void}
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client used to interact with the Roles API.
 *
 * The same {@link RolesClient} instance is reused across iterations.
 *
 * @returns {[RolesClient]} Tuple containing the Roles API client.
 */
function getClients() {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.PORTAL.ENDUSER
        ]);
        const tokenOpts = new PersonalTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }

    if (rolesApiClient == undefined) {
        rolesApiClient = new RolesClient(__ENV.BASE_URL, tokenGenerator);
    }

    return [rolesApiClient];
}

/**
 * k6 default function executed for each iteration.
 *
 * @returns {void}
 */
export default function () {
    const [rolesApiClient] = getClients();

    const query = {
        role: "daglig-leder",
        variant: "AS",
    };

    MetadataBuildingBlocks.Roles.GetRoleResources(rolesApiClient, query, labels);
}
