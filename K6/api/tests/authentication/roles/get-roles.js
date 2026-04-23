import { GetRoles } from "../../../building-blocks/authentication/roles/index.js";
import { RolesApiClient } from "../../../../clients/authentication/index.js";
import { getOptions } from "../../../../helpers.js";

const labels = "getRoles";
let rolesApiClient = undefined;
export const options = getOptions([labels]);

export default function () {
    if (rolesApiClient == undefined) {
        rolesApiClient = new RolesApiClient(__ENV.BASE_URL);
    }
    GetRoles(rolesApiClient, labels);
}
