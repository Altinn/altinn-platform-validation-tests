import runAddRemoveForretningsforerRoleForClient from "./add-rm-forretningsforer-role-for-client.js";
import { setup as addRmForretningsforerRoleSetup } from "./add-rm-forretningsforer-role-for-client.js";
import runAddRemoveRegnskapsforerRoleForClient from "./add-rm-regnskapsforer-role-for-client.js";
import { setup as addRmRegnskapsforerRoleSetup } from "./add-rm-regnskapsforer-role-for-client.js";
import runAddRemoveRevisorRoleForClient from "./add-rm-revisor-role-for-client.js";
import { setup as addRmRevisorRoleSetup } from "./add-rm-revisor-role-for-client.js";
import runLookUpOnIdportenEmail from "./look-up-on-idporten-email.js";
import runLookUpOnUsername from "./look-up-on-username.js";
import { setup as runLookUpOnUsernameSetup } from "./look-up-on-username.js";

export function setup() {
    return {
        "runLookUpOnUsername": runLookUpOnUsernameSetup(),
        "addRmRevisorRoleForClient": addRmRevisorRoleSetup(),
        "addRmRegnskapsforerRoleForClient": addRmRegnskapsforerRoleSetup(),
        "addRmForretningsforerRoleForClient": addRmForretningsforerRoleSetup(),
    };
}

export default function (data) {
    runLookUpOnUsername(data.runLookUpOnUsername);
    runLookUpOnIdportenEmail();
    runAddRemoveRevisorRoleForClient(data.addRmRevisorRoleForClient);
    runAddRemoveRegnskapsforerRoleForClient(data.addRmRegnskapsforerRoleForClient);
    runAddRemoveForretningsforerRoleForClient(
        data.addRmForretningsforerRoleForClient,
    );
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
