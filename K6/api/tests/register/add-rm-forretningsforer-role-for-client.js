import { CcrCustomerRoles } from "../../../clients/register/index.js";
import { getOptions } from "../../../helpers.js";
import { fetchFacilitators, runAddRemoveCcrRoleForClient } from "./ccr-role-commons.js";

/**
 * @file add-rm-forretningsforer-role-for-client.js
 * @description Verifies that removing and re-adding the forretningsforer role in
 * ER is reflected in Altinn Register. See ccr-role-commons.js for the shared body.
 */

const label = { step: "test-add-rm-forretningsforer-role" };

export const options = getOptions([label]);

export function setup() {
    return fetchFacilitators(CcrCustomerRoles.FORRETNINGSFORER);
}

export default function (facilitators) {
    runAddRemoveCcrRoleForClient(
        CcrCustomerRoles.FORRETNINGSFORER,
        facilitators,
        label,
    );
}
