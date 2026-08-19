import runCreateAndUploadCorrespondence, { setup as setupCreateAndUploadCorrespondence } from "./create-and-upload-correspondence.js";
import runCreateAndUploadCorrespondenceSingleUser, { setup as setupCreateAndUploadCorrespondenceSingleUser } from "./create-and-upload-correspondence-single-user.js";
import runGetCorrespondence, { setup as setupGetCorrespondence } from "./get-correspondence.js";
import runGetCorrespondenceOverview, { setup as setupGetCorrespondenceOverview } from "./get-correspondence-overview.js";
import runInitializeCorrespondence, { setup as setupInitializeCorrespondence } from "./initialize-correspondence.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        createAndUploadCorrespondenceSingleUser: setupCreateAndUploadCorrespondenceSingleUser(),
        createAndUploadCorrespondence: setupCreateAndUploadCorrespondence(),
        getCorrespondenceOverview: setupGetCorrespondenceOverview(),
        getCorrespondence: setupGetCorrespondence(),
        initializeCorrespondence: setupInitializeCorrespondence(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default function (data) {
    runCreateAndUploadCorrespondenceSingleUser(data.createAndUploadCorrespondenceSingleUser);
    runCreateAndUploadCorrespondence(data.createAndUploadCorrespondence);
    runGetCorrespondenceOverview(data.getCorrespondenceOverview);
    runGetCorrespondence(data.getCorrespondence);
    runInitializeCorrespondence(data.initializeCorrespondence);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
