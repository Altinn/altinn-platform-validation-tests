// Keep versioned libs in a single file to simplify updates
export {
    uuidv4,
    randomItem,
    randomIntBetween
} from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export { default as papaparse } from "https://jslib.k6.io/papaparse/5.1.1/index.js";

export {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
    MaskinportenAccessTokenGenerator
} from "https://github.com/Altinn/altinn-platform/releases/download/altinn-k6-lib-0.0.5/index.js";

import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

const expectWithConfiguration = expect.configure({
    soft: true,
    softMode: "throw",
});

export { expectWithConfiguration as expect };
