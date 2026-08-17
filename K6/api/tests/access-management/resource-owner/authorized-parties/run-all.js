export { handleSummary } from "../../../../../common-imports.js";

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
import SubjectLookupForms from "./subject-lookup-forms.js";
import UnitHierarchyDelegationDirections from "./unit-hierarchy-delegation-directions.js";

/**
 * Fetches the fixtures once for every scenario in the run.
 *
 * @returns {{testdata: object, hierarchy: object, sharedTestData: object}} The fixtures.
 */
export function setup() {
    return CommonSetup();
}

// The scenarios are independent of each other, so this order is only for reading.
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
