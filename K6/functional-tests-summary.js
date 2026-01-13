/**
 * Shared end-of-test summary for functional E2E k6 scripts.
 *
 * Add to a test script:
 *   export { handleSummary } from "../../../../functional-tests-summary.js";
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 *
 * Output separator: adds a blank line between each test scenario summary.
 */

function collectGroupChecksLines(group, indent, lines) {
    const groupName = group?.name;
    if (typeof groupName === "string" && groupName.length > 0) {
        lines.push("");
        lines.push(`Testscenario: ${indent}${groupName}`);
    }

    const checks = Array.isArray(group?.checks) ? group.checks : [];
    for (const c of checks) {
        const ok = (c?.fails ?? 0) === 0;
        const icon = ok ? "✅" : "❌";
        lines.push(
            `${indent}  ${icon} ${c.name} (passes: ${c.passes}, fails: ${c.fails})`
        );
    }

    const groups = Array.isArray(group?.groups) ? group.groups : [];
    for (const g of groups) {
        collectGroupChecksLines(g, `${indent}  `, lines);
    }
}

export function handleSummary(data) {
    if (data?.root_group) {
        const lines = [];
        collectGroupChecksLines(data.root_group, "", lines);
        // Print once to keep output tidy.
        console.log(lines.join("\n"));
        return {};
    }

    // Fallback: if someone runs with --new-machine-readable-summary or a wrapper changes shape,
    // dump a minimal hint rather than silently doing nothing.
    console.log(
        "handleSummary: unexpected summary shape; enable raw dump by temporarily logging JSON.stringify(data)"
    );
    return {};
}
