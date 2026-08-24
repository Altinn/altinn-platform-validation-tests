import runWithAltinn2WithAltinn3 from "./with-altinn2-with-altinn3.js";
import runWithAltinn2WithAltinn3WithAccesspackages from "./with-altinn2-with-altinn3-with-accesspackages.js";
import runWithAltinn2WithAltinn3WithAccesspackagesWithOrgcode, { setup as setupWithAltinn2WithAltinn3WithAccesspackagesWithOrgcode } from "./with-altinn2-with-altinn3-with-accesspackages-with-orgcode.js";
import runWithAltinn3 from "./with-altinn3.js";
import runWithAltinn3WithAccesspackages from "./with-altinn3-with-accesspackages.js";
import runWithAltinn3WithAccesspackagesWithoutResources from "./with-altinn3-with-accesspackages-without-resources.js";
import runWithAltinn3WithoutIncludepartiesviakeyroles from "./with-altinn3-without-includepartiesviakeyroles.js";
import runWithAltinn3WithoutIncludepartiesviakeyrolesWithAccesspackages from "./with-altinn3-without-includepartiesviakeyroles-with-accesspackages.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        withAltinn2WithAltinn3WithAccesspackagesWithOrgcode: setupWithAltinn2WithAltinn3WithAccesspackagesWithOrgcode(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 */
export default function () {
    runWithAltinn2WithAltinn3WithAccesspackagesWithOrgcode();
    runWithAltinn2WithAltinn3WithAccesspackages();
    runWithAltinn2WithAltinn3();
    runWithAltinn3WithAccesspackagesWithoutResources();
    runWithAltinn3WithAccesspackages();
    runWithAltinn3WithoutIncludepartiesviakeyrolesWithAccesspackages();
    runWithAltinn3WithoutIncludepartiesviakeyroles();
    runWithAltinn3();
}
