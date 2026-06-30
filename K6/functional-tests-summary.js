/**
/**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 *
 */

import postSlackMessage from "./slack.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

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

export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const onlyFailures = runningInK8s;
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
