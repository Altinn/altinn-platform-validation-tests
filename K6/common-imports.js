// Keep versioned libs in a single file to simplify updates
export {
    uuidv4,
    randomItem,
    randomIntBetween,
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export { URL } from "https://jslib.k6.io/url/1.0.0/index.js";

export { default as papaparse } from "https://jslib.k6.io/papaparse/5.1.1/index.js";

export {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
    MaskinportenAccessTokenGenerator,
    PlatformTokenGenerator,
} from "https://github.com/Altinn/altinn-platform/releases/download/altinn-k6-lib-0.0.9/index.js";

import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

// Custom end-of-test summary used by our functional E2E scripts.
export { handleSummary } from "./functional-tests-summary.js";

const expectWithConfiguration = expect.configure({
    soft: true,
    softMode: "throw",
});

export { expectWithConfiguration as expect };
