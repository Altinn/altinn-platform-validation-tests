import { group } from "k6";

import { ResourceAccessListMode } from "../../../../clients/resource-registry/index.js";
import { requireEnv } from "../../../../helpers.js";
import {
    ResourceCreatePolicy,
    ResourceCreateResource,
    ResourceUpdateResource,
} from "../../../building-blocks/resource-registry/resource/index.js";
import {
    buildPolicyFile,
    buildResource,
    DELEGABLE_ACCESS_LIST_RESOURCE,
    DELEGABLE_RESOURCE,
    DELEGABLE_TOGGLE_RESOURCE,
    getOwnerResourceClient,
    NOT_DELEGABLE_RESOURCE,
} from "./resources.js";

/**
 * Provisions the four resources the tests in this folder need, as Digdir:
 *
 * - k6-not-delegable-resource, with delegable set to false.
 * - k6-delegable-resource, with delegable set to true.
 * - k6-access-list-resource, delegable and with access lists enforced.
 * - k6-delegable-toggle-resource, reset to delegable. The propagation test flips
 * it and puts it back, so running this again also repairs a run that died
 * halfway.
 *
 * Deliberately left out of run-all.js and functional.yaml, and given no delete
 * step. Run it once per environment, on purpose, with
 * `k6 run K6/api/tests/access-management/local-resource-data/create-resources.js`.
 * Deleting a resource leaves rows behind in resourceregistry.resourcesubjects,
 * reported as Altinn/altinn-resource-registry#848.
 *
 * Access Management imports a new resource from the registry's change feed,
 * which took about 50 s in at22. Give it a minute before running the tests.
 */

const RESOURCES = [
    { identifier: NOT_DELEGABLE_RESOURCE, delegable: false },
    { identifier: DELEGABLE_RESOURCE, delegable: true },
    { identifier: DELEGABLE_ACCESS_LIST_RESOURCE, delegable: true, accessListMode: ResourceAccessListMode.Enabled },
    { identifier: DELEGABLE_TOGGLE_RESOURCE, delegable: true },
];

export function setup() {
    requireEnv([
        "BASE_URL",
        "ENVIRONMENT",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);
}

export default function () {
    const resourceClient = getOwnerResourceClient();

    RESOURCES.forEach(({ identifier, delegable, accessListMode }, index) => {
        const step = index + 1;

        group(`Resource ${step}: ${identifier}`, () => {
            // POST refuses an identifier that is taken, so an existing resource
            // is updated instead. Straight off the client rather than through the
            // building block: a resource that is not there yet is the ordinary
            // case on a first run, and should not report a failed check for it.
            const exists = resourceClient.ResourceGetResource(
                identifier,
                null,
                { step: `${step}. Read ${identifier}` },
            ).status === 200;

            const resource = buildResource(identifier, delegable, accessListMode);
            const written = exists
                ? ResourceUpdateResource(resourceClient, identifier, resource, { step: `${step}. Update ${identifier}` })
                : ResourceCreateResource(resourceClient, resource, { step: `${step}. Create ${identifier}` });

            if (!written) {
                return;
            }

            // The policy endpoint answers 201 to a POST whether or not a policy
            // is already stored, and replaces it either way.
            ResourceCreatePolicy(
                resourceClient,
                identifier,
                buildPolicyFile(identifier),
                { step: `${step}. Publish policy for ${identifier}` },
            );
        });
    });
}
