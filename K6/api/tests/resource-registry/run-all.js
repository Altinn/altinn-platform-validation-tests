import runAccessListEtag, { setup as setupAccessListEtag, teardown as teardownAccessListEtag } from "./access-list-etag.js";
import runAccessListLifecycle, { setup as setupAccessListLifecycle, teardown as teardownAccessListLifecycle } from "./access-list-lifecycle.js";
import runAccessListMemberships, { setup as setupAccessListMemberships, teardown as teardownAccessListMemberships } from "./access-list-memberships.js";
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
        accessListEtag: setupAccessListEtag(),
        accessListMemberships: setupAccessListMemberships(),
        resourceV2PolicyRights: setupResourceV2PolicyRights(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the
 * shared clients, building blocks or checks can be verified in one go.
 *
 * The two healthchecks are public and run everywhere. The access list and
 * policy rights tests need the token generator and test data, so they run
 * on at22, at23 and tt02 (see functional.yaml).
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
    runAccessListEtag();
    runAccessListMemberships(data.accessListMemberships);
    runResourceV2PolicyRights();
}

/**
 * k6 teardown stage. Runs the teardown each test brings, so the lists the
 * tests created are gone when the run is over.
 *
 * @param {ReturnType<typeof setup>} data Setup results, keyed per test.
 */
export function teardown(data) {
    teardownAccessListMemberships(data.accessListMemberships);
    teardownAccessListLifecycle();
    teardownAccessListEtag();
}
