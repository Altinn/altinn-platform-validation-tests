import runAddRemoveCcrRoleForClient from "./add-rm-ccr-role-for-client.js";
import { setup as addRmCcrRoleForClientSetup } from "./add-rm-ccr-role-for-client.js";
import runLookUpOnIdportenEmail from "./look-up-on-idporten-email.js";
import runLookUpOnUsername from "./look-up-on-username.js";
import { setup as runLookUpOnUsernameSetup } from "./look-up-on-username.js";

export function setup() {
    return {
        "runLookUpOnUsername": runLookUpOnUsernameSetup(),
        "addRmCcrRoleForClient": addRmCcrRoleForClientSetup(),
    };
}

export default function (data) {
    runLookUpOnUsername(data.runLookUpOnUsername);
    runLookUpOnIdportenEmail();
    runAddRemoveCcrRoleForClient(data.addRmCcrRoleForClient);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
