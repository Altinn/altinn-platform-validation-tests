import runAccessListLifecycle, { setup as setupAccessListLifecycle, teardown as teardownAccessListLifecycle } from "./access-list-lifecycle.js";
import runGetOrgs, { setup as setupGetOrgs } from "./get-orgs.js";
import runGetUpdatedResources, { setup as setupGetUpdatedResources } from "./get-updated-resources.js";
import runResourceV2PolicyRights, { setup as setupResourceV2PolicyRights } from "./resource-v2-policy-rights.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings and keeps the
 * results apart.
 *
 * @returns One entry per test that needs setup data.
 */
export function setup() {
    return {
        getUpdatedResources: setupGetUpdatedResources(),
        getOrgs: setupGetOrgs(),
        accessListLifecycle: setupAccessListLifecycle(),
        resourceV2PolicyRights: setupResourceV2PolicyRights(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the
 * shared clients, building blocks or checks can be verified in one go.
 *
 * The two healthchecks and the policy rights test only read. The lifecycle
 * test is the one test that writes: it takes one access list through its
 * whole life, conditional headers and platform lookups included, so a run
 * costs the registry's event log one list's worth of events and no more.
 * It needs the token generator and test data, so it runs on at22, at23 and
 * tt02 (see functional.yaml).
 *
 * create-resource-and-policy.js is deliberately left out. Deleting a resource
 * leaves its rows in resourceregistry.resourcesubjects behind with deleted set
 * to false, and nothing cleans them up, reported as
 * Altinn/altinn-resource-registry#848 and concluded in #488. Every run of that
 * test therefore leaks a couple of rows, so it has to be started on purpose
 * rather than swept along by a run of everything. Wire it back in here once #848
 * is fixed.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export default function (data) {
    runGetUpdatedResources();
    runGetOrgs();
    runAccessListLifecycle(data.accessListLifecycle);
    runResourceV2PolicyRights();
}

/**
 * k6 teardown stage. Runs the lifecycle test's teardown, so the list it
 * created is gone when the run is over.
 */
export function teardown() {
    teardownAccessListLifecycle();
}
