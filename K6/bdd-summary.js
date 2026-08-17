/**
 * A BDD harness for k6: `scenario()` to declare one, `handleSummary` to report them.
 *
 * A scenario is a complete thought, the way a feature file writes one. It has a name, the
 * setup it assumes, the single action it performs, and the outcomes that followed:
 *
 * Scenario: A main unit delegates to another main unit
 * GIVEN main unit A has delegated access to main unit B
 * WHEN a service owner lists the authorized parties of B's daily leader
 * THEN main unit A is in the list
 * AND it holds the access it delegated
 *
 * The setup and the action are declared, so they cannot drift into one run on clause, and
 * a reader is never left working out which half of a sentence was the precondition. The
 * outcomes come from the checks inside the scenario body, first as the THEN and then as
 * ANDs, so one scenario has exactly one WHEN and one THEN however many things it asserts.
 *
 * GIVEN steps carry no tick. They state what the environment already holds, which this
 * suite takes on trust from its fixtures rather than verifying, and marking them would
 * claim more than was done. The WHEN carries the request's own success, which is what the
 * status and parse checks of a building block actually mean. Those checks are therefore
 * not printed as steps of their own, only surfaced by name when they fail.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 */

import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";
import { group } from "k6";

import postSlackMessage from "./slack.js";

/**
 * Separates the declared parts inside a group name. Prose does not contain it, so the
 * summary can split a group name back into the scenario's name, GIVENs and WHEN.
 */
const PART = " || ";

const OUTCOME = /^\s*(THEN|AND|BUT)\b/i;

/**
 * Declares one scenario.
 *
 * @param {{name: string, given?: string|Array<string>, when: string}} declared
 * The scenario's name, the setup it assumes, and the single action it performs.
 * @param {Function} body - Performs the action and asserts the outcomes.
 * @returns {*} Whatever the body returns.
 */
export function scenario(declared, body) {
    const givens = declared.given === undefined
        ? []
        : (Array.isArray(declared.given) ? declared.given : [declared.given]);

    const parts = [
        declared.name,
        ...givens.map((given, index) => `${index === 0 ? "GIVEN" : "AND"} ${given}`),
        `WHEN ${declared.when}`,
    ];

    return group(parts.join(PART), body);
}

/**
 * Splits a group name back into what `scenario()` declared.
 *
 * @param {string} groupName - The group name to read.
 * @returns {{name: string|null, steps: Array<string>}} The scenario's name and declared steps.
 */
function ReadDeclared(groupName) {
    const parts = String(groupName ?? "").split(PART);

    if (parts.length === 1) {
        // Not declared through scenario(), so there is no name to show and the group name
        // is the only step there is.
        return { name: null, steps: parts };
    }

    return { name: parts[0], steps: parts.slice(1) };
}

/**
 * Collects one entry per group that holds checks, in run order, tagged with its feature.
 *
 * @param {object} group - A k6 group from the summary data.
 * @param {Array<string>} ancestors - Names of the enclosing groups, outermost first.
 * @param {Array<object>} scenarios - Accumulator, appended to in place.
 * @returns {Array<object>} The scenarios, in run order.
 */
function CollectScenarios(group, ancestors, scenarios) {
    const checks = Array.isArray(group?.checks) ? group.checks : [];
    const groups = Array.isArray(group?.groups) ? group.groups : [];

    if (checks.length > 0) {
        const declared = ReadDeclared(group?.name);

        scenarios.push({
            feature: ancestors.length > 0 ? ancestors[0] : null,
            name: declared.name,
            declaredSteps: declared.steps,
            outcomes: checks.filter((check) => OUTCOME.test(check.name)),
            plumbing: checks.filter((check) => !OUTCOME.test(check.name)),
        });
    }

    const nextAncestors = group?.name ? [...ancestors, group.name] : ancestors;

    for (const nested of groups) {
        CollectScenarios(nested, nextAncestors, scenarios);
    }

    return scenarios;
}

/**
 * Whether every check in a list passed.
 *
 * @param {Array<object>} checks - The checks to inspect.
 * @returns {boolean} True if none of them failed.
 */
function AllPassed(checks) {
    return checks.every((check) => check.fails === 0);
}

/**
 * Whether anything in a scenario did not hold.
 *
 * @param {object} scenario - The scenario to inspect.
 * @returns {boolean} True if any check in it failed.
 */
function Failed(scenario) {
    return !AllPassed([...scenario.outcomes, ...scenario.plumbing]);
}

/**
 * Renders one scenario as its Gherkin steps.
 *
 * @param {object} scenario - The scenario to render.
 * @param {Array<string>} lines - Accumulator, appended to in place.
 * @returns {Array<string>} The lines, for chaining.
 */
function RenderScenario(scenario, lines) {
    lines.push("");

    // A group that did not go through scenario() has no name of its own, so its steps are
    // printed without a heading rather than under an invented one.
    if (scenario.name !== null) {
        lines.push(`  Scenario: ${scenario.name}`);
    }

    for (const step of scenario.declaredSteps) {
        // A GIVEN is stated, not asserted, so it gets no tick. The WHEN is the action, and
        // whether it succeeded is exactly what the request's own checks say.
        const isAction = /^\s*WHEN\b/i.test(step);
        const mark = isAction ? (AllPassed(scenario.plumbing) ? "✅" : "❌") : "  ";

        lines.push(`    ${mark} ${step}`);

        if (isAction) {
            for (const failure of scenario.plumbing.filter((check) => check.fails > 0)) {
                lines.push(`         ↳ ${failure.name}`);
            }
        }
    }

    scenario.outcomes.forEach((check) => {
        lines.push(`    ${check.fails === 0 ? "✅" : "❌"} ${check.name}`);
    });

    return lines;
}

/**
 * Renders the report.
 *
 * @param {Array<object>} scenarios - The collected scenarios.
 * @param {boolean} onlyFailures - Keep only the scenarios that failed, for Slack.
 * @returns {Array<string>} The report lines.
 */
function Render(scenarios, onlyFailures) {
    const perFeature = new Map();

    for (const scenario of scenarios) {
        if (!perFeature.has(scenario.feature)) {
            perFeature.set(scenario.feature, []);
        }

        perFeature.get(scenario.feature).push(scenario);
    }

    const lines = [];
    let outcomeCount = 0;
    let outcomesFailed = 0;
    let scenariosFailed = 0;

    for (const [feature, inFeature] of perFeature) {
        const reported = onlyFailures ? inFeature.filter(Failed) : inFeature;

        for (const scenario of inFeature) {
            outcomeCount += scenario.outcomes.length;
            outcomesFailed += scenario.outcomes.filter((check) => check.fails > 0).length;

            if (Failed(scenario)) {
                scenariosFailed += 1;
            }
        }

        if (reported.length === 0) {
            continue;
        }

        lines.push("");
        lines.push(feature ?? "(no feature)");

        for (const scenario of reported) {
            RenderScenario(scenario, lines);
        }
    }

    const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

    lines.push("");
    lines.push(scenariosFailed === 0
        ? `${plural(scenarios.length, "scenario")}, ${plural(outcomeCount, "outcome")}, all held.`
        : `${scenariosFailed} of ${plural(scenarios.length, "scenario")} did not hold, ${outcomesFailed} of ${plural(outcomeCount, "outcome")}.`);

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
    const scenarios = CollectScenarios(data.root_group, [], []);

    if (runningInK8s) {
        if (scenarios.some(Failed)) {
            // Only the scenarios that did not hold, so the message says what broke instead
            // of restating everything that worked.
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
