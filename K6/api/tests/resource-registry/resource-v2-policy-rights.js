import { check, group } from "k6";

import { getItemFromList, getOptions, requireEnv } from "../../../helpers.js";
import { ResourceV2GetPolicyRights } from "../../building-blocks/resource-registry/resource-v2/index.js";
import { PolicyRightsDomainChecks } from "../../domain-checks/resource-registry/policy-rights.js";
import { getResources, getResourceV2Client } from "./commons.js";

const rightsLabel = { step: "Read the decomposed policy rights of a resource" };

export const options = getOptions([rightsLabel]);

/**
 * Reads the resources once. Each row names the actions its policy grants,
 * which is what lets the test check content rather than only that something
 * came back.
 *
 * @returns {{resources: Array<import("./commons.js").Resource>}} The test data.
 */
export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT"]);

    return { resources: getResources() };
}

/**
 * Test: the v2 policy rights endpoint decomposes a resource's policy into one
 * named right per action.
 *
 * The endpoint is public. It answers with a flat list of rights, each scoped
 * to the resource and carrying the action it grants and a display name, and
 * a policy that arrived intact has exactly one right per action. Service
 * owner rights are asked for too, so the rights the owner keeps for itself
 * are decomposed as well rather than filtered out.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 */
export default function (data) {
    const client = getResourceV2Client();
    const { resourceId, actions } = getItemFromList(data.resources);

    group("Read the decomposed policy rights of a resource", function () {
        const rights = ResourceV2GetPolicyRights(client, resourceId, { includeServiceOwnerRights: true }, rightsLabel);

        PolicyRightsDomainChecks.CheckOneRightPerAction(rights, actions, "ResourceV2GetPolicyRights");
        PolicyRightsDomainChecks.CheckRightsForResource(rights, resourceId, "ResourceV2GetPolicyRights");
        PolicyRightsDomainChecks.CheckRightsCoverActions(rights, actions, "ResourceV2GetPolicyRights");

        const unnamed = (rights ?? []).filter((right) => !right.name || !right.key);

        const named = check(rights, {
            "ResourceV2GetPolicyRights - every right carries a key and a display name": () =>
                Array.isArray(rights) && rights.length > 0 && unnamed.length === 0,
        });

        if (!named) {
            console.error(`ResourceV2GetPolicyRights - rights without a key or name: ${JSON.stringify(unnamed)}`);
        }
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
