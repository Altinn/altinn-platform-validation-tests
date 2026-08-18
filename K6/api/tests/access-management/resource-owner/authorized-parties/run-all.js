export { handleSummary } from "../../../../../bdd-summary.js";

import AccessInformationFlags from "./access-information-flags.js";
import AuthorizationBoundaries from "./authorization-boundaries.js";
import ClientsAndKeyRoleParties from "./clients-and-key-role-parties.js";
import { setup as CommonSetup } from "./common.js";
import DeletedParties from "./deleted-parties.js";
import ForretningsforerClients from "./forretningsforer-clients.js";
import KeyRoleFilter from "./key-role-filter.js";
import OrgCodeFilter from "./org-code-filter.js";
import PartyFilter from "./party-filter.js";
import PartyKinds from "./party-kinds.js";
import ResourceFilter from "./resource-filter.js";
import { SetupData } from "./setup-data.types.js";
import SubjectLookupForms from "./subject-lookup-forms.js";
import UnitHierarchyDelegationDirections from "./unit-hierarchy-delegation-directions.js";

/**
 * Fetches the fixtures once for every scenario in the run.
 *
 * @returns {SetupData} The fixtures every feature reads, as its `data` argument.
 */
export function setup() {
    return CommonSetup();
}

// The scenarios are independent of each other, so this order is only for reading.
/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    ClientsAndKeyRoleParties(data);
    AccessInformationFlags(data);
    KeyRoleFilter(data);
    PartyFilter(data);
    ResourceFilter(data);
    UnitHierarchyDelegationDirections(data);
    PartyKinds(data);
    AuthorizationBoundaries(data);
    DeletedParties(data);
    SubjectLookupForms(data);
    OrgCodeFilter(data);
    ForretningsforerClients(data);
}
