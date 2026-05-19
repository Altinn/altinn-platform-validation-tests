import { nameShortChange } from "./testcase_1_change_org_name.js";
import { addMedl } from "./testcase_2_add_styremedlem.js";
import { removeMedl } from "./testcase_3_remove_styremedlem.js";
import { daglChange } from "./testcase_4_replace_daglig_leder.js";
import { styrChange } from "./testcase_5_replace_styreleder.js";
import { fadrChange } from "./testcase_6_change_forretningsadresse.js";
import { contactChange } from "./testcase_7_update_contact_info.js";
import { addFmva } from "./testcase_8_add_frivillig_mva.js";
import { kasteStyret } from "./testcase_9_kaste_styret.js";

/**
 * @file run-all.js
 * @description Runs all ER sync testcases as named scenarios.
 *
 * k6 run run-all.js \
 *   -e ENVIRONMENT=at22 -e BASE_URL=https://platform.at22.altinn.cloud \
 *   -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> \
 *   -e REGISTER_SUBSCRIPTION_KEY=<key>
 */

export const options = {
    scenarios: {
        "testcase-1-change-org-name":          { executor: "shared-iterations", exec: "nameShortChange", vus: 1, iterations: 1 },
        "testcase-2-add-styremedlem":          { executor: "shared-iterations", exec: "addMedl",         vus: 1, iterations: 1 },
        "testcase-3-remove-styremedlem":       { executor: "shared-iterations", exec: "removeMedl",      vus: 1, iterations: 1 },
        "testcase-4-replace-daglig-leder":     { executor: "shared-iterations", exec: "daglChange",      vus: 1, iterations: 1 },
        "testcase-5-replace-styreleder":       { executor: "shared-iterations", exec: "styrChange",      vus: 1, iterations: 1 },
        "testcase-6-change-forretningsadresse":{ executor: "shared-iterations", exec: "fadrChange",      vus: 1, iterations: 1 },
        "testcase-7-update-contact-info":      { executor: "shared-iterations", exec: "contactChange",   vus: 1, iterations: 1 },
        "testcase-8-add-frivillig-mva":        { executor: "shared-iterations", exec: "addFmva",         vus: 1, iterations: 1 },
        "testcase-9-kaste-styret":             { executor: "shared-iterations", exec: "kasteStyret",     vus: 1, iterations: 1 },
    },
};

export { nameShortChange, addFmva, fadrChange, daglChange, contactChange, styrChange, addMedl, removeMedl, kasteStyret };

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";
