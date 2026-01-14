import runAddRemoveRevisorRoleForClient from "./add-rm-revisor-role-for-client.js";
import runLookUpOnUsername from "./look-up-on-username.js";

export default function () {
    runLookUpOnUsername();
    runAddRemoveRevisorRoleForClient();
}
// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
