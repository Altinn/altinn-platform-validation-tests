import runAddRemoveRevisorRoleForClient from "./add-rm-revisor-role-for-client.js";
import runLookUpOnIdportenEmail from "./look-up-on-idporten-email.js";
import runLookUpOnUsername from "./look-up-on-username.js";
import { setup as runLookUpOnUsernameSetup } from "./look-up-on-username.js";

export function setup() {
    return {
        "runLookUpOnUsername": runLookUpOnUsernameSetup(),
    };
}

export default function (data) {
    runLookUpOnUsername(data.runLookUpOnUsername);
    runLookUpOnIdportenEmail();
    runAddRemoveRevisorRoleForClient();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
