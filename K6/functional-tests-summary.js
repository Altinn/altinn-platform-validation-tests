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
    const groupName = group.name;
    const checks = Array.isArray(group?.checks) ? group.checks : [];
    const hasFailures = checks.some(c => c.fails > 0);

    if (!onlyFailures || (onlyFailures && hasFailures)) {
        lines.push(`\nTestscenario: ${groupName}`);
    }
    for (const c of checks) {
        const ok = c.fails === 0;
        const icon = ok ? "✅" : "❌";
        if (!onlyFailures || (onlyFailures && !ok)) {
            lines.push(` ${icon} ${c.name} (passes: ${c.passes}, fails: ${c.fails})`);
        }
    }

    const groups = Array.isArray(group?.groups) ? group.groups : [];
    for (const g of groups) {
        collectGroupChecksLines(g, lines, onlyFailures);
    }
}

export function handleSummary(data) {
    const runningInK8s = __ENV.RUNNING_IN_K8S == "true";
    const onlyFailures = runningInK8s;

    if (data?.root_group) {
        const lines = [];
        const root = data.root_group;

        const groups = Array.isArray(root?.groups) ? root.groups : [];
        for (const g of groups) {
            collectGroupChecksLines(g, lines, onlyFailures);
        }

        const hasFailures = lines.some(line => line.includes("❌"));

        if (runningInK8s) {
            if (hasFailures) {
                postSlackMessage(data, lines.join("\n"));
            }

            return {
                stdout: textSummary(data, { enableColors: false }),
            };
        }

        return {
            stdout: lines.join("\n"),
        };
    }
}
