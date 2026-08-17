export { handleSummary } from "../../../../../common-imports.js";

import ClientsAndKeyRoleParties from "./01-clients-and-key-role-parties.js";
import AccessInformationFlags from "./02-access-information-flags.js";
import KeyRoleFilter from "./03-key-role-filter.js";
import PartyFilter from "./04-party-filter.js";
import ResourceFilter from "./05-resource-filter.js";
import UnitHierarchyDelegationDirections from "./06-unit-hierarchy-delegation-directions.js";
import PartyKinds from "./07-party-kinds.js";
import AuthorizationBoundaries from "./08-authorization-boundaries.js";
import DeletedParties from "./09-deleted-parties.js";
import SubjectLookupForms from "./10-subject-lookup-forms.js";
import OrgCodeFilter from "./11-org-code-filter.js";
import ForretningsforerClients from "./12-forretningsforer-clients.js";
import { setup as CommonSetup } from "./common.js";

/**
 * Fetches the fixtures once for every scenario in the run.
 *
 * @returns {{testdata: object, hierarchy: object, sharedTestData: object}} The fixtures.
 */
export function setup() {
    return CommonSetup();
}

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
