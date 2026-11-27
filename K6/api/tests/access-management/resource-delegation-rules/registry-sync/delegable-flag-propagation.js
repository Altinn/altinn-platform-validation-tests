import { check, fail, group, sleep } from "k6";
import { Trend } from "k6/metrics";

import { GetResourceDelegationCheckQueryBuilder } from "../../../../../clients/access-management/enduser/connections/index.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { ResourceUpdateResource } from "../../../../building-blocks/resource-registry/resource/index.js";
import { DelegationCheckReasonCode } from "../../../../domain-checks/access-management/resource-delegation.js";
import { getEnduserClients, getEnduserTokenOpts, setup as commonSetup } from "../common.js";
import { buildResource, DELEGABLE_TOGGLE_RESOURCE, getOwnerResourceClient } from "../resources.js";

const baselineLabel = { step: "1. Make the resource delegable and wait for Access Management" };
const disableLabel = { step: "2. Mark the resource not delegable and wait for Access Management" };
const enableLabel = { step: "3. Mark the resource delegable again and wait for Access Management" };
const pollLabel = { step: "Poll the enduser delegation check" };
const teardownLabel = { step: "Teardown - leave the resource delegable" };

/**
 * How long Access Management gets to pick up one change, and how often it is
 * asked in the meantime.
 *
 * Since Altinn/altinn-auth#4789 the delegation check reads the flag from Access
 * Management's own copy, which the import from the registry's change feed keeps
 * up to date. That took 15 to 61 s in at22 and at23 on 2026-11-25. Three minutes
 * per change leaves room for a slow import, and keeps the three changes inside
 * k6's default ten minute limit, so the test needs no run settings of its own.
 * A change that takes longer than that fails the test, which is the point.
 */
const TIMEOUT_SECONDS = 180;
const POLL_INTERVAL_SECONDS = 10;

export const options = getOptions([baselineLabel, disableLabel, enableLabel, pollLabel, teardownLabel]);

/**
 * Seconds from a change in the registry to the delegation check reflecting it,
 * tagged by the direction of the change.
 */
const propagationSeconds = new Trend("local_resource_propagation_seconds");

/**
 * Reads the test data and makes sure the resource is in the registry.
 *
 * @returns {ReturnType<typeof commonSetup>} The test data.
 */
export function setup() {
    const data = commonSetup();

    const res = getOwnerResourceClient().ResourceGetResource(DELEGABLE_TOGGLE_RESOURCE, null, baselineLabel);

    if (res.status !== 200) {
        fail(`${DELEGABLE_TOGGLE_RESOURCE} is not in the registry (status ${res.status}). Run create-resources.js first.`);
    }

    return data;
}

/**
 * Asks the delegation check whether the resource is refused as not delegable.
 *
 * Straight off the client and without checks: while waiting, a wrong answer is
 * the expected one, and should not count as a failed check every time it comes
 * back. Anything that is not a parseable 200 counts as no answer yet.
 *
 * @param {ReturnType<typeof commonSetup>["users"][number]} user The daglig leder.
 * @returns {boolean|null} True if every right is refused as not delegable, false
 * if none is, null when there is no answer or the rights disagree.
 */
function refusedAsNotDelegable(user) {
    const { connections } = getEnduserClients();

    const res = connections.GetResourceDelegationCheck(
        new GetResourceDelegationCheckQueryBuilder()
            .withParty(user.orgUuid)
            .withResource(DELEGABLE_TOGGLE_RESOURCE)
            .build(),
        pollLabel,
    );

    if (res.status !== 200) {
        return null;
    }

    /** @type {Array<*>} */
    let rights = [];

    try {
        rights = JSON.parse(String(res.body))?.rights ?? [];
    } catch (error) {
        return null;
    }

    if (rights.length === 0) {
        return null;
    }

    const refused = rights.map((right) =>
        (right?.reasonCodes ?? []).includes(DelegationCheckReasonCode.ResourceNotDelegable));

    if (refused.every(Boolean)) {
        return true;
    }

    return refused.some(Boolean) ? null : false;
}

/**
 * Waits until the delegation check says what is expected, or the time is up.
 *
 * @param {ReturnType<typeof commonSetup>["users"][number]} user The daglig leder.
 * @param {boolean} expectRefused Whether the resource should be refused.
 * @returns {number|null} Seconds it took, or null when the time ran out.
 */
function waitForDelegationCheck(user, expectRefused) {
    const started = Date.now();

    while ((Date.now() - started) / 1000 < TIMEOUT_SECONDS) {
        if (refusedAsNotDelegable(user) === expectRefused) {
            return (Date.now() - started) / 1000;
        }

        sleep(POLL_INTERVAL_SECONDS);
    }

    return null;
}

/**
 * Writes the delegable flag to the registry, as the owner.
 *
 * @param {boolean} delegable The flag to write.
 * @param {{[key: string]: string}} label k6 request label.
 * @returns {boolean} True if the registry took it.
 */
function writeDelegable(delegable, label) {
    return ResourceUpdateResource(
        getOwnerResourceClient(),
        DELEGABLE_TOGGLE_RESOURCE,
        buildResource(DELEGABLE_TOGGLE_RESOURCE, delegable),
        label,
    );
}

/**
 * Test: a change to the delegable flag in the resource registry reaches Access
 * Management (Altinn/altinn-auth#4860).
 *
 * Since #4789 the delegation check reads the flag from Access Management's own
 * copy of the resource, which the import from the registry's change feed keeps
 * up to date. The flag is flipped to false and back to true, and each time the
 * delegation check has to follow within TIMEOUT_SECONDS. How long it took is
 * reported as local_resource_propagation_seconds.
 *
 * Starts by making sure the resource is delegable, so a run that died halfway
 * through does not leave the next one measuring from the wrong state.
 *
 * Not scheduled: it writes to the registry and takes a few minutes. Run it by
 * hand in each environment.
 *
 * @param {ReturnType<typeof setup>} data The test data read in setup.
 * @returns {void}
 */
export default function (data) {
    const user = getItemFromList(data.users);
    const { tokenGenerator } = getEnduserClients();

    tokenGenerator.setTokenGeneratorOptions(getEnduserTokenOpts(user));

    const steps = [
        { label: baselineLabel, delegable: true, direction: "baseline" },
        { label: disableLabel, delegable: false, direction: "to_not_delegable" },
        { label: enableLabel, delegable: true, direction: "to_delegable" },
    ];

    for (const { label, delegable, direction } of steps) {
        let passed = false;

        group(label.step, function () {
            if (!writeDelegable(delegable, label)) {
                return;
            }

            const seconds = waitForDelegationCheck(user, !delegable);

            if (seconds !== null && direction !== "baseline") {
                propagationSeconds.add(seconds, { direction });
            }

            passed = check(seconds, {
                [`Delegation check reflects delegable=${delegable} within ${TIMEOUT_SECONDS} s (${direction})`]: (s) => s !== null,
            });

            if (!passed) {
                console.error(`${direction}: the delegation check did not reflect delegable=${delegable} within ${TIMEOUT_SECONDS} s`);
            }
        });

        // Every later step measures from the state this one set up, so it means
        // nothing once this one has not held.
        if (!passed) {
            return;
        }
    }
}

/**
 * Leaves the resource delegable, whatever happened during the run.
 *
 * @returns {void}
 */
export function teardown() {
    writeDelegable(true, teardownLabel);
}
