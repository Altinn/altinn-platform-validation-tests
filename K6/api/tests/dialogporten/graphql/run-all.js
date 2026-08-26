import { setup as commonFunctionsSetup } from "./common-functions.js";
import runGetDialogsForEnduser from "./get-dialogs-for-enduser.js";
import runGetDialogsForEnduserServiceowner from "./get-dialogs-for-enduser-serviceowner.js";
import runGetDialogsForParties from "./get-dialogs-for-parties.js";
import runGetDialogsForPartiesServiceowner from "./get-dialogs-for-parties-serviceowner.js";
import runGetDialogsForRandomParty from "./get-dialogs-for-random-party.js";
import runGetFilterServiceResources from "./get-filter-service-resources.js";
import runGetParties from "./get-parties.js";
import runGetPartiesWorstCase, { setup as setupGetPartiesWorstCase } from "./get-parties-worst-case.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commonFunctions: commonFunctionsSetup(),
        getPartiesWorstCase: setupGetPartiesWorstCase(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runGetDialogsForEnduserServiceowner(data.commonFunctions);
    runGetDialogsForEnduser(data.commonFunctions);
    runGetDialogsForPartiesServiceowner(data.commonFunctions);
    runGetDialogsForParties(data.commonFunctions);
    runGetDialogsForRandomParty(data.commonFunctions);
    runGetFilterServiceResources(data.commonFunctions);
    runGetPartiesWorstCase();
    runGetParties(data.commonFunctions);
}
