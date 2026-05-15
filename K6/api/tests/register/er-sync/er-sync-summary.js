/**
 * Custom k6 summary handler for ER sync tests.
 *
 * Outputs one line per testcase:
 *   ✅  testcase-name       (all checks passed)
 *   ❌  testcase-name       (one or more checks failed)
 *       ↳ failing check name
 *       ↳ another failing check name
 */

function collectFailingChecks(group) {
    const failing = [];
    for (const c of group.checks || []) {
        if (c.fails > 0) failing.push(c.name);
    }
    for (const child of group.groups || []) {
        failing.push(...collectFailingChecks(child));
    }
    return failing;
}

export function handleSummary(data) {
    const lines = ["\nER Sync Test Results", "=".repeat(40)];
    let passed = 0;
    let failed = 0;

    for (const group of data.root_group.groups || []) {
        const failingChecks = collectFailingChecks(group);

        if (failingChecks.length === 0) {
            lines.push(`✅  ${group.name}`);
            passed++;
        } else {
            lines.push(`❌  ${group.name}`);
            for (const name of failingChecks) {
                lines.push(`    ↳ ${name}`);
            }
            failed++;
        }
    }

    const total = passed + failed;
    lines.push(`\n${passed}/${total} testcases passed\n`);

    return { stdout: lines.join("\n") };
}
