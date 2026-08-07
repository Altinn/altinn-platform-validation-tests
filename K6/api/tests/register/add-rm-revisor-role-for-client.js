import { CcrCustomerRoles } from "../../../clients/register/index.js";
import { getOptions } from "../../../helpers.js";
import { fetchFacilitators, runAddRemoveCcrRoleForClient } from "./ccr-role-commons.js";

/**
 * @file add-rm-revisor-role-for-client.js
 * @description Verifies that removing and re-adding the revisor role in ER is
 * reflected in Altinn Register. See ccr-role-commons.js for the shared body.
 */

const label = { step: "test-add-rm-revisor-role" };

export const options = getOptions([label]);

export function setup() {
    return fetchFacilitators(CcrCustomerRoles.REVISOR);
}

export default function (facilitators) {
    runAddRemoveCcrRoleForClient(CcrCustomerRoles.REVISOR, facilitators, label);
}
