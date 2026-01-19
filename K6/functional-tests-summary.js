/**
/**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 *
 */

import postSlackMessage from "./slack.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

function collectGroupChecksLines(group, lines) {
    const groupName = group.name;
    lines.push(`\nTestscenario: ${groupName}`);

    const checks = Array.isArray(group?.checks) ? group.checks : [];
    for (const c of checks) {
        const ok = c.fails === 0;
        const icon = ok ? "✅" : "❌";
        lines.push(` ${icon} ${c.name} (passes: ${c.passes}, fails: ${c.fails})`);
    }

    const groups = Array.isArray(group?.groups) ? group.groups : [];
    for (const g of groups) {
        collectGroupChecksLines(g, lines);
    }
}

export function handleSummary(data) {
    if (data?.root_group) {
        const lines = [];
        const root = data.root_group;

        const groups = Array.isArray(root?.groups) ? root.groups : [];
        for (const g of groups) {
            collectGroupChecksLines(g, lines);
        }

        const hasFailures = lines.filter(line => line.includes("❌")).length > 0;

        if (__ENV.RUNNING_IN_K8S == "true") {
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
