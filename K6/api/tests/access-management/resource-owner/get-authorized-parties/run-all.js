import { setup as commonFunctionsSetup } from "./common-functions.js";
import runForOrg from "./for-org.js";
import runForOrgWithA2 from "./for-org-with-a2.js";
import runForSystemUser, { setup as setupForSystemUser } from "./for-system-user.js";
import runForSystemUserWithA2, { setup as setupForSystemUserWithA2 } from "./for-system-user-with-a2.js";
import runForUser from "./for-user.js";
import runForUserAvgiverListe from "./for-user-avgiver-liste.js";
import runForUserDialogporten from "./for-user-dialogporten.js";
import runForUserDialogportenWithFilter, { setup as setupForUserDialogportenWithFilter } from "./for-user-dialogporten-with-filter.js";
import runForUserIncludePartiesViaKeyRole from "./for-user-include-parties-via-key-role.js";
import runForUserIncludePartiesViaKeyRoleWithA2 from "./for-user-include-parties-via-key-role-with-a2.js";
import runForUserWithA2 from "./for-user-with-a2.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commonFunctions: commonFunctionsSetup(),
        forSystemUserWithA2: setupForSystemUserWithA2(),
        forSystemUser: setupForSystemUser(),
        forUserDialogportenWithFilter: setupForUserDialogportenWithFilter(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runForOrgWithA2(data.commonFunctions);
    runForOrg(data.commonFunctions);
    runForSystemUserWithA2(data.forSystemUserWithA2);
    runForSystemUser(data.forSystemUser);
    runForUserAvgiverListe(data.commonFunctions);
    runForUserDialogportenWithFilter(data.forUserDialogportenWithFilter);
    runForUserDialogporten(data.commonFunctions);
    runForUserIncludePartiesViaKeyRoleWithA2(data.commonFunctions);
    runForUserIncludePartiesViaKeyRole(data.commonFunctions);
    runForUserWithA2(data.commonFunctions);
    runForUser(data.commonFunctions);
}
