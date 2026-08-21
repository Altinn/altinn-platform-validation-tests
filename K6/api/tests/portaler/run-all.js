import runGetInfoDotAltinnDotCloud from "./get-info-dot-altinn-dot-cloud.js";
import runGetInfoDotAltinnDotCloudSkjemaoversikt from "./get-info-dot-altinn-dot-cloud-skjemaoversikt.js";
import runGetInfoDotAltinnDotCloudSok, { setup as setupGetInfoDotAltinnDotCloudSok } from "./get-info-dot-altinn-dot-cloud-sok.js";
import runGetInfoDotAltinnDotCloudStarteOgDrive from "./get-info-dot-altinn-dot-cloud-starte-og-drive.js";
import runGetInfoportalApiWhenLoggedin, { setup as setupGetInfoportalApiWhenLoggedin } from "./get-infoportal-api-when-loggedin.js";
import runGetInfoportalHealth from "./get-infoportal-health.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        getInfoDotAltinnDotCloudSok: setupGetInfoDotAltinnDotCloudSok(),
        getInfoportalApiWhenLoggedin: setupGetInfoportalApiWhenLoggedin(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default function (data) {
    runGetInfoDotAltinnDotCloudSkjemaoversikt();
    runGetInfoDotAltinnDotCloudSok(data.getInfoDotAltinnDotCloudSok);
    runGetInfoDotAltinnDotCloudStarteOgDrive();
    runGetInfoDotAltinnDotCloud();
    runGetInfoportalApiWhenLoggedin(data.getInfoportalApiWhenLoggedin);
    runGetInfoportalHealth();
}
