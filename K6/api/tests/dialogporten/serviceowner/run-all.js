import { setup as commonFunctionsSetup } from "./common-functions.js";
import runCreateDialogEnduser from "./create-dialog-enduser.js";
import runCreateDialogOrg from "./create-dialog-org.js";
import runCreateDialogTransmissionActivity from "./create-dialog-transmission-activity.js";
import runGetDialogsAndExtractDetails from "./get-dialogs-and-extract-details.js";
import runGetDialogsEnduserServiceresource from "./get-dialogs-enduser-serviceresource.js";
import runGetDialogsEnduserServiceresourceCreatedafter from "./get-dialogs-enduser-serviceresource-createdafter.js";
import runGetDialogsEnduserServiceresourceCreatedbefore from "./get-dialogs-enduser-serviceresource-createdbefore.js";
import runGetDialogsEnduserServiceresourceSearch from "./get-dialogs-enduser-serviceresource-search.js";
import runGetDialogsEnduserServiceresourceSearchCreatedafter from "./get-dialogs-enduser-serviceresource-search-createdafter.js";
import runGetDialogsEnduserServiceresourceSearchNohit from "./get-dialogs-enduser-serviceresource-search-nohit.js";
import runGetDialogsParty from "./get-dialogs-party.js";
import runGetDialogsPartyCreatedafter from "./get-dialogs-party-createdafter.js";
import runGetDialogsPartyCreatedbefore from "./get-dialogs-party-createdbefore.js";
import runGetEndusercontext from "./get-endusercontext.js";
import runGetEndusercontextWorstcase, { setup as setupGetEndusercontextWorstcase } from "./get-endusercontext-worstcase.js";
import runShouldSendNotification, { setup as setupShouldSendNotification } from "./should-send-notification.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        commonFunctions: commonFunctionsSetup(),
        getEndusercontextWorstcase: setupGetEndusercontextWorstcase(),
        shouldSendNotification: setupShouldSendNotification(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per setup.
 */
export default function (data) {
    runCreateDialogEnduser(data.commonFunctions);
    runCreateDialogOrg(data.commonFunctions);
    runCreateDialogTransmissionActivity(data.commonFunctions);
    runGetDialogsAndExtractDetails(data.commonFunctions);
    runGetDialogsEnduserServiceresourceCreatedafter(data.commonFunctions);
    runGetDialogsEnduserServiceresourceCreatedbefore(data.commonFunctions);
    runGetDialogsEnduserServiceresourceSearchCreatedafter(data.commonFunctions);
    runGetDialogsEnduserServiceresourceSearchNohit(data.commonFunctions);
    runGetDialogsEnduserServiceresourceSearch(data.commonFunctions);
    runGetDialogsEnduserServiceresource(data.commonFunctions);
    runGetDialogsPartyCreatedafter(data.commonFunctions);
    runGetDialogsPartyCreatedbefore(data.commonFunctions);
    runGetDialogsParty(data.commonFunctions);
    runGetEndusercontextWorstcase();
    runGetEndusercontext(data.commonFunctions);
    runShouldSendNotification(data.shouldSendNotification);
}
