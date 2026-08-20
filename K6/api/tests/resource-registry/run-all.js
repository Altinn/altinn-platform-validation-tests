import runCreateResourceAndPolicy, { setup as createResourceAndPolicySetup } from "./create-resource-and-policy.js";

export function setup() {
    return {
        "createResourceAndPolicy": createResourceAndPolicySetup(),
    };
}

export default function (data) {
    runCreateResourceAndPolicy(data.createResourceAndPolicy);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
