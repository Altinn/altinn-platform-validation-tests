import { GetRoles } from "../../../building-blocks/authentication/roles/index.js";
import { RolesApiClient } from "../../../../clients/authentication/index.js";
import { getOptions } from "../../../../helpers.js";
import { requireEnv } from "../../../../helpers.js";

const labels = { action: "getRoles" };
let rolesApiClient = undefined;
export const options = getOptions([labels]);

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

export default function () {
    if (rolesApiClient == undefined) {
        rolesApiClient = new RolesApiClient(__ENV.BASE_URL);
    }
    GetRoles(rolesApiClient, labels);
}
