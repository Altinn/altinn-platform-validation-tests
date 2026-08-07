import { CcrCustomerRoles } from "../../../clients/register/index.js";
import { getOptions } from "../../../helpers.js";
import { fetchFacilitators, runAddRemoveCcrRoleForClient } from "./ccr-role-commons.js";

/**
 * @file add-rm-regnskapsforer-role-for-client.js
 * @description Verifies that removing and re-adding the regnskapsforer role in ER
 * is reflected in Altinn Register. See ccr-role-commons.js for the shared body.
 */

const label = { step: "test-add-rm-regnskapsforer-role" };

export const options = getOptions([label]);

export function setup() {
    return fetchFacilitators(CcrCustomerRoles.REGNSKAPSFORER);
}

export default function (facilitators) {
    runAddRemoveCcrRoleForClient(
        CcrCustomerRoles.REGNSKAPSFORER,
        facilitators,
        label,
    );
}
