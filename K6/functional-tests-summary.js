/**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 */

import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

import postSlackMessage from "./slack.js";

// A check that fails once in a few hundred iterations is usually a blip, not a
// regression, and posting it to Slack trains the team to ignore the channel.
// A check therefore only earns a Slack message when its pass rate drops below
// this, which is the same level the Grafana alerts use.
//
// The threshold only applies to tests that run more than one iteration. A single
// iteration has no repetition to tell a blip apart from a break, so there every
// failure alerts. That also keeps a broken step visible in a test where several
// steps share one check name: the checks in the summary are not split per step,
// so one dead step out of forty would otherwise sit at 97.5% and stay silent.
const DEFAULT_PASS_RATE_THRESHOLD = 0.95;

/**
 * @typedef {object} SummaryCheck
 * @property {string} name Name of the check.
 * @property {number} passes Number of passing observations.
 * @property {number} fails Number of failing observations.
 */

/**
 * @typedef {object} SummaryGroup
 * @property {string} [name] Name of the group, absent on the root group.
 * @property {SummaryCheck[]} [checks] Checks registered directly in the group.
 * @property {SummaryGroup[]} [groups] Nested groups.
 */

/**
 * @typedef {object} SummaryData
 * @property {SummaryGroup} root_group Root of the group tree.
 * @property {Record<string, { values?: Record<string, number> }>} [metrics] Built-in and custom metrics.
 */

/**
 * @typedef {object} CheckResult
 * @property {string} group Name of the group the check belongs to.
 * @property {string} name Name of the check.
 * @property {number} passes Number of passing observations.
 * @property {number} fails Number of failing observations.
 * @property {number} passRate Share of observations that passed, between 0 and 1.
 */

/**
 * A check with the Slack verdict filled in.
 *
 * @typedef {CheckResult & { alerts: boolean }} DecidedCheck
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
 * Number of iterations the test ran.
 *
 * Falls back to one when the metric is missing, which is the strict end: every
 * failure alerts. Better a message we did not need than a broken step nobody
 * hears about.
 *
 * @param {SummaryData} data End-of-test summary data from k6.
 * @returns {number} Iteration count, at least one.
 */
function iterationCount(data) {
    const count = data?.metrics?.iterations?.values?.count;

    return Number.isFinite(count) && count > 1 ? count : 1;
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
 * Decide which checks are worth a Slack message.
 *
 * Done in one place so the report and the Slack decision cannot drift apart.
 *
 * @param {CheckResult[]} results Checks from the summary, without the verdict.
 * @param {number} threshold Pass rate below which a check alerts.
 * @param {number} iterations Number of iterations the test ran.
 * @returns {DecidedCheck[]} The checks with `alerts` filled in.
 */
function decideAlerts(results, threshold, iterations) {
    return results.map((result) => ({
        ...result,
        alerts:
            result.fails > 0 && (iterations <= 1 || result.passRate < threshold),
    }));
}

/**
 * Render the report we print to stdout and post to Slack.
 *
 * Failing checks that stay above the threshold are marked with a warning rather
 * than dropped, so the report still shows them even when they do not alert.
 *
 * @param {DecidedCheck[]} results Checks to render.
 * @returns {string} The rendered report.
 */
function buildReport(results) {
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
            icon = result.alerts ? "❌" : "⚠️";
        }

        lines.push(
            ` ${icon} ${result.name} (passes: ${result.passes}, fails: ${result.fails}${rate})`,
        );
    }

    return lines.join("\n");
}

/**
 * @param {SummaryData} data End-of-test summary data from k6.
 * @returns {{ stdout: string }} Output written by k6 when the test ends.
 */
export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const threshold = passRateThreshold();
    const iterations = iterationCount(data);
    const results = decideAlerts(
        collectCheckResults(data.root_group),
        threshold,
        iterations,
    );
    const report = buildReport(results);

    const alerting = results.filter((r) => r.alerts);
    const tolerated = results.filter((r) => r.fails > 0 && !r.alerts);

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
