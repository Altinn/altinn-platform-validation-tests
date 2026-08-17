/**
 * Summary for k6 scripts written as BDD scenarios.
 *
 * A drop in alternative to functional-tests-summary.js for suites where the group
 * names the action, so it reads as a GIVEN or a WHEN, and each check names an outcome
 * that was observed, so it reads as a THEN or an AND.
 *
 * The report keeps only those sentences. Checks that do not read as BDD are the
 * plumbing of getting the request out and parsed, and they outnumber the outcomes,
 * so they are dropped while they pass. They are always shown when they fail, because
 * a request that never succeeded is the reason every outcome under it went red, and
 * hiding it would leave the report describing symptoms with no cause.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 */

import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

import postSlackMessage from "./slack.js";

const BDD_SENTENCE = /^\s*(GIVEN|WHEN|THEN|AND|BUT)\b/i;

/**
 * Whether a check name reads as a BDD outcome rather than as plumbing.
 *
 * @param {string} name - The check name.
 * @returns {boolean} True if the name opens with a BDD keyword.
 */
function IsBddSentence(name) {
    return BDD_SENTENCE.test(String(name ?? ""));
}

/**
 * Flattens the group tree into one entry per group that holds checks.
 *
 * @param {object} group - A k6 group from the summary data.
 * @param {Array<object>} scenarios - Accumulator, appended to in place.
 * @returns {Array<object>} One entry per group that holds checks, in run order.
 */
function CollectScenarios(group, scenarios) {
    const checks = Array.isArray(group?.checks) ? group.checks : [];
    const groups = Array.isArray(group?.groups) ? group.groups : [];

    if (checks.length > 0) {
        scenarios.push({
            action: group?.name || "(no group)",
            outcomes: checks.map((check) => ({
                name: check.name,
                fails: check.fails,
                isBdd: IsBddSentence(check.name),
            })),
        });
    }

    for (const nested of groups) {
        CollectScenarios(nested, scenarios);
    }

    return scenarios;
}

/**
 * Renders the report.
 *
 * @param {Array<object>} scenarios - The collected scenarios.
 * @param {boolean} onlyFailures - Drop everything that passed, for the Slack message.
 * @returns {Array<string>} The report lines.
 */
function Render(scenarios, onlyFailures) {
    const lines = [];
    let outcomeCount = 0;
    let outcomesFailed = 0;
    let requestsFailed = 0;
    let stepsFailed = 0;

    for (const scenario of scenarios) {
        // Plumbing is only worth a line when it failed. Everything that reads as BDD
        // stays, so a green report is the scenario in its own words.
        const shown = scenario.outcomes.filter((outcome) => outcome.isBdd || outcome.fails > 0);
        const reported = onlyFailures ? shown.filter((outcome) => outcome.fails > 0) : shown;

        // Outcomes and request plumbing are tallied apart. Counting them together lets
        // the numerator outrun the denominator, since the denominator is outcomes only.
        outcomeCount += scenario.outcomes.filter((outcome) => outcome.isBdd).length;
        outcomesFailed += scenario.outcomes.filter((outcome) => outcome.isBdd && outcome.fails > 0).length;
        requestsFailed += scenario.outcomes.filter((outcome) => !outcome.isBdd && outcome.fails > 0).length;

        if (scenario.outcomes.some((outcome) => outcome.fails > 0)) {
            stepsFailed += 1;
        }

        if (reported.length === 0) {
            continue;
        }

        lines.push("");
        lines.push(scenario.action);

        for (const outcome of reported) {
            const mark = outcome.fails === 0 ? "✅" : "❌";
            // A failing non-BDD check is the request itself, so it is labelled rather
            // than left to look like an outcome of the scenario.
            const label = outcome.isBdd ? outcome.name : `[request] ${outcome.name}`;

            lines.push(`  ${mark} ${label}`);
        }
    }

    lines.push("");

    if (outcomesFailed === 0 && requestsFailed === 0) {
        lines.push(`${outcomeCount} outcomes across ${scenarios.length} steps, all held.`);

        return lines;
    }

    lines.push(`${outcomesFailed} of ${outcomeCount} outcomes did not hold, in ${stepsFailed} of ${scenarios.length} steps.`);

    if (requestsFailed > 0) {
        // Worth saying plainly: when the request never succeeded, the outcomes under it
        // are consequences rather than findings, and the request is what to look at.
        lines.push(`${requestsFailed} request checks failed too, so start there: outcomes under a request that did not succeed are consequences, not findings.`);
    }

    return lines;
}

/**
 * Builds the end of test report.
 *
 * @param {object} data - The k6 end of test summary data.
 * @returns {object} What k6 should write, keyed by destination.
 */
export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const scenarios = CollectScenarios(data.root_group, []);
    const hasFailures = scenarios.some((scenario) => scenario.outcomes.some((outcome) => outcome.fails > 0));

    if (runningInK8s) {
        if (hasFailures) {
            // Only the outcomes that did not hold, so the message says what broke
            // instead of restating everything that worked.
            postSlackMessage(data, Render(scenarios, true).join("\n"));
        }

        return {
            stdout: textSummary(data, { enableColors: false }),
        };
    }

    return {
        stdout: `${Render(scenarios, false).join("\n")}\n\n`,
    };
}
