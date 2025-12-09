import { GetRoles } from "../../../building-blocks/auth/roles/index.js";
import { RolesApiClient } from "../../../../clients/auth/index.js";
import { getOptions } from "../../../../helpers.js";

const label = "getRoles";
let rolesApiClient = undefined;
export const options = getOptions([label]);

export default function () {
    if (rolesApiClient == undefined) {
        rolesApiClient = new RolesApiClient(__ENV.BASE_URL);
    }
    GetRoles(rolesApiClient, label);
}
