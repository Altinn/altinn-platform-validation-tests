import { GetRoles } from "../../../building-blocks/authentication/roles/index.js";
import { RolesApiClient } from "../../../../clients/authentication/index.js";
import { getOptions } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";

const labels = { step: "getRoles" };

/**
 * @type {RolesApiClient | undefined}
 */
let rolesApiClient = undefined;

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
 * The same {@link RolesApiClient} instance is reused across iterations.
 *
 * @returns {[RolesApiClient]} Tuple containing the Roles API client.
 */
function getClients() {
    if (rolesApiClient == undefined) {
        rolesApiClient = new RolesApiClient(__ENV.BASE_URL);
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
    GetRoles(rolesApiClient, labels);
}
