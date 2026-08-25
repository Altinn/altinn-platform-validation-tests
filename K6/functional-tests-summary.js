/**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 */

import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

import postSlackMessage from "./slack.js";

// A check that fails once in a few hundred iterations is usually a blip, not a
// regression, and posting it to Slack trains the team to ignore the channel.
// A check only earns a Slack message when its pass rate drops below this, which
// is the same level the Grafana alerts use. Note that a functional test running
// a single iteration still alerts on its first failure: one fail out of one is
// a 0% pass rate.
const DEFAULT_PASS_RATE_THRESHOLD = 0.95;

/**
 * @typedef {object} SummaryCheck
 * @property {string} name Name of the check.
 * @property {number} passes Number of passing iterations.
 * @property {number} fails Number of failing iterations.
 */

/**
 * @typedef {object} SummaryGroup
 * @property {string} [name] Name of the group, absent on the root group.
 * @property {SummaryCheck[]} [checks] Checks registered directly in the group.
 * @property {SummaryGroup[]} [groups] Nested groups.
 */

/**
 * @typedef {object} CheckResult
 * @property {string} group Name of the group the check belongs to.
 * @property {string} name Name of the check.
 * @property {number} passes Number of passing iterations.
 * @property {number} fails Number of failing iterations.
 * @property {number} passRate Share of iterations that passed, between 0 and 1.
 */

/**
 * Pass rate below which a failing check is worth a Slack message.
 *
 * @returns {number} Threshold between 0 and 1.
 */
function passRateThreshold() {
    const raw = __ENV.SLACK_CHECK_PASS_RATE_THRESHOLD;

    if (!raw) {
        return DEFAULT_PASS_RATE_THRESHOLD;
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        console.error(
            `SLACK_CHECK_PASS_RATE_THRESHOLD must be a number between 0 and 1, got "${raw}". ` +
            `Falling back to ${DEFAULT_PASS_RATE_THRESHOLD}.`,
        );
        return DEFAULT_PASS_RATE_THRESHOLD;
    }

    return parsed;
}

/**
 * Flatten the group tree into one entry per check.
 *
 * @param {SummaryGroup} group Group from the k6 summary data, possibly nested.
 * @param {CheckResult[]} results Accumulator the checks are pushed onto.
 * @returns {CheckResult[]} The accumulator, for convenience.
 */
function collectCheckResults(group, results = []) {
    const groupName = group?.name || "(Ikke tilknyttet group)";
    const checks = Array.isArray(group?.checks) ? group.checks : [];
    const groups = Array.isArray(group?.groups) ? group.groups : [];

    for (const check of checks) {
        const total = check.passes + check.fails;

        results.push({
            group: groupName,
            name: check.name,
            passes: check.passes,
            fails: check.fails,
            passRate: total === 0 ? 1 : check.passes / total,
        });
    }

    for (const g of groups) {
        collectCheckResults(g, results);
    }

    return results;
}

/**
 * Render the report we print to stdout and post to Slack.
 *
 * Failing checks that stay above the threshold are marked with a warning rather
 * than dropped, so the report still shows them even when they do not alert.
 *
 * @param {CheckResult[]} results Checks to render.
 * @param {number} threshold Pass rate below which a check alerts.
 * @returns {string} The rendered report.
 */
function buildReport(results, threshold) {
    const lines = [];
    let currentGroup = null;

    for (const result of results) {
        if (result.group !== currentGroup) {
            currentGroup = result.group;
            lines.push(`\nTestscenario: ${currentGroup}`);
        }

        const total = result.passes + result.fails;
        const rate =
            total > 1 ? `, ${(result.passRate * 100).toFixed(1)}% ok` : "";

        let icon = "✅";
        if (result.fails > 0) {
            icon = result.passRate < threshold ? "❌" : "⚠️";
        }

        lines.push(
            ` ${icon} ${result.name} (passes: ${result.passes}, fails: ${result.fails}${rate})`,
        );
    }

    return lines.join("\n");
}

/**
 * @param {{ root_group: SummaryGroup }} data End-of-test summary data from k6.
 * @returns {{ stdout: string }} Output written by k6 when the test ends.
 */
export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const threshold = passRateThreshold();
    const results = collectCheckResults(data.root_group);
    const report = buildReport(results, threshold);

    const alerting = results.filter((r) => r.fails > 0 && r.passRate < threshold);
    const tolerated = results.filter(
        (r) => r.fails > 0 && r.passRate >= threshold,
    );

    if (runningInK8s) {
        for (const result of tolerated) {
            console.log(
                `Check "${result.name}" failed ${result.fails} of ` +
                `${result.passes + result.fails} times, which is above the ` +
                `${threshold * 100}% pass rate threshold. Not posting to Slack.`,
            );
        }

        if (alerting.length > 0) {
            postSlackMessage(data, report);
        }

        return {
            stdout: textSummary(data, { enableColors: false }),
        };
    }

    return {
    // If you dont append on the initial lines when using stdout, it wont print the last check??
        stdout: report + "\n\n=== END SUMMARY === \n\n",
    };
}
