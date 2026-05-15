import { nameShortChange } from "./er-sync.js";
import { addFmva } from "./add-fmva.js";
import { fadrChange } from "./change-fadr.js";
import { daglChange } from "./change-dagl.js";
import { contactChange } from "./change-contact.js";
import { styrChange } from "./change-styr.js";

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
        "change-org-short-name":   { executor: "shared-iterations", exec: "nameShortChange", vus: 1, iterations: 1 },
        "register-fmva":           { executor: "shared-iterations", exec: "addFmva",         vus: 1, iterations: 1 },
        "change-business-address": { executor: "shared-iterations", exec: "fadrChange",      vus: 1, iterations: 1 },
        "replace-daglig-leder":    { executor: "shared-iterations", exec: "daglChange",      vus: 1, iterations: 1 },
        "update-contact-info":     { executor: "shared-iterations", exec: "contactChange",   vus: 1, iterations: 1 },
        "replace-styreleder":      { executor: "shared-iterations", exec: "styrChange",      vus: 1, iterations: 1 },
    },
};

export { nameShortChange, addFmva, fadrChange, daglChange, contactChange, styrChange };

// Reporting tools
export { handleSummary } from "./er-sync-summary.js";
