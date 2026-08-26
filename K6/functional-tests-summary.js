/**
 * /**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 *
 */

import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

import postSlackMessage from "./slack.js";

/**
 * The part of a k6 summary group this summary reads.
 *
 * @typedef {object} SummaryGroup
 * @property {string} [name] Name of the group, absent for the root group.
 * @property {{name: string, passes: number, fails: number}[]} [checks] Checks recorded directly in this group.
 * @property {SummaryGroup[]} [groups] Nested groups.
 */

/**
 * Appends one line per check in the group, then recurses into its subgroups.
 *
 * @param {SummaryGroup} group Group to read checks from.
 * @param {string[]} lines Lines collected so far, appended to in place.
 * @param {boolean} onlyFailures Kept for the recursive calls; every check is
 * listed either way, and the caller decides what to do with the failures.
 * @returns {void} Nothing. The lines are collected in the array passed in.
 */
function collectGroupChecksLines(group, lines, onlyFailures = false) {
    const groupName = group?.name || "(Ikke tilknyttet group)";
    const checks = Array.isArray(group?.checks) ? group.checks : [];
    const groups = Array.isArray(group?.groups) ? group.groups : [];

    if (checks.length > 0) {
        lines.push(`\nTestscenario: ${groupName}`);
    }

    for (const check of checks) {
        const ok = check.fails === 0;
        lines.push(
            ` ${ok ? "✅" : "❌"} ${check.name} (passes: ${check.passes}, fails: ${check.fails})`,
        );
    }

    for (const g of groups) {
        collectGroupChecksLines(g, lines, onlyFailures);
    }
}

/**
 * @param {{root_group: SummaryGroup}} data The k6 end-of-test summary.
 * @returns {{stdout: string}} What k6 writes to stdout.
 */
export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const onlyFailures = runningInK8s;
    /** @type {string[]} */
    const lines = [];
    collectGroupChecksLines(data.root_group, lines, onlyFailures);

    const hasFailures = lines.some((line) => line.includes("❌"));

    if (runningInK8s) {
        if (hasFailures) {
            postSlackMessage(data, lines.join("\n"));
        }

        return {
            stdout: textSummary(data, { enableColors: false }),
        };
    }

    return {
    // If you dont append on the initial lines when using stdout, it wont print the last check??
        stdout: lines.join("\n") + "\n\n=== END SUMMARY === \n\n",
    };
}
