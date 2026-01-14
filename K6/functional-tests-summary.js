/**
/**
 * Summary for functional E2E k6 scripts.
 *
 * Docs: https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/
 *
 */

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

        // Print report to console
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
