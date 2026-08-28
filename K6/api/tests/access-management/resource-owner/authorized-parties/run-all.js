export { handleSummary } from "../../../../../common-imports.js";

/**
 * Everything the twelve scenarios read between them.
 *
 * @typedef {SetupData & ClientsAndKeyRolePartiesSetupData & AccessInformationFlagsSetupData & KeyRoleFilterSetupData & PartyFilterSetupData & ResourceFilterSetupData & SubjectLookupFormsSetupData} AllSetupData
 */

import AccessInformationFlags, { setup as AccessInformationFlagsSetup } from "./access-information-flags.js";
import AuthorizationBoundaries from "./authorization-boundaries.js";
import ClientsAndKeyRoleParties, { setup as ClientsAndKeyRolePartiesSetup } from "./clients-and-key-role-parties.js";
import { setup as CommonSetup } from "./common.js";
import DeletedParties from "./deleted-parties.js";
import ForretningsforerClients from "./forretningsforer-clients.js";
import KeyRoleFilter, { setup as KeyRoleFilterSetup } from "./key-role-filter.js";
import OrgCodeFilter from "./org-code-filter.js";
import PartyFilter, { setup as PartyFilterSetup } from "./party-filter.js";
import PartyKinds from "./party-kinds.js";
import ResourceFilter, { setup as ResourceFilterSetup } from "./resource-filter.js";
import { AccessInformationFlagsSetupData, ClientsAndKeyRolePartiesSetupData, KeyRoleFilterSetupData, PartyFilterSetupData, ResourceFilterSetupData, SetupData, SubjectLookupFormsSetupData } from "./setup-data.types.js";
import SubjectLookupForms, { setup as SubjectLookupFormsSetup } from "./subject-lookup-forms.js";
import UnitHierarchyDelegationDirections from "./unit-hierarchy-delegation-directions.js";

/**
 * Fetches the fixtures once for every scenario in the run.
 *
 * Six scenarios read a csv of their own rather than the shared json fixture, so their
 * setups are merged in here rather than folded into the common one. Each one names the
 * fixture it reads, so a scenario that gains or loses a column changes one file.
 *
 * @returns {AllSetupData} The fixtures every feature reads, as its `data` argument.
 */
export function setup() {
    return {
        ...CommonSetup(),
        ...ClientsAndKeyRolePartiesSetup(),
        ...AccessInformationFlagsSetup(),
        ...KeyRoleFilterSetup(),
        ...PartyFilterSetup(),
        ...ResourceFilterSetup(),
        ...SubjectLookupFormsSetup(),
    };
}

// The scenarios are independent of each other, so this order is only for reading.
/**
 * Runs the feature.
 *
 * @param {AllSetupData} data - The fixtures returned by setup().
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
