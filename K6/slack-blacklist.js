// Blacklist for Slack notifications.
//
// Some tests are known to be noisy (high retry counts, flaky dependencies) and
// flood the team channels without telling us anything new. An entry here stops
// postSlackMessage from posting. The test itself keeps running and its results
// keep flowing to Grafana, so nothing is lost -- only the Slack message.
//
// Each entry is matched against the env vars the k6 operator injects into the
// pod. A field that is present must match; a field that is omitted acts as a
// wildcard. Supported fields:
//
//   namespace   - NAMESPACE,    e.g. "access-management"
//   environment - ENVIRONMENT,  e.g. "yt01"
//   testFile    - TESTFILENAME, either the repo-relative path or just the
//                 basename, e.g. "get-resources.js"
//   testScope   - TEST_SCOPE,   the folder containing the test, e.g. "roles".
//                 Note this is NOT the test type; it defaults to the test
//                 file's parent directory and can be overridden per test
//                 definition in the config yaml.
//   testId      - TESTID, "<environment>-<test-file-name>" plus a "-smoke" or
//                 "-break" suffix for those test types, e.g. "at22-get-
//                 resources" or "at22-get-resources-smoke". Deterministic, so
//                 it is the way to target one test type in one environment.
//
// Prefer narrow entries. `{ namespace: "access-management" }` silences an
// entire team's alerts; the noisy case is usually one test in one environment.
//
// Always add a `reason`, and an `issue` link when there is one, so entries can
// be cleaned up later instead of silencing a test forever.
//
// Examples:
//
//   { testFile: "get-resources.js", environment: "at22",
//     reason: "AT22 backend flaky, tracked upstream", issue: "..." }
//
//   { testId: "at22-get-resources-smoke",
//     reason: "smoke run trips thresholds by design" }

const ENV_BY_FIELD = {
    namespace: "NAMESPACE",
    environment: "ENVIRONMENT",
    testScope: "TEST_SCOPE",
    testId: "TESTID",
    testFile: "TESTFILENAME",
};

const MATCHABLE_FIELDS = Object.keys(ENV_BY_FIELD);
const METADATA_FIELDS = ["reason", "issue"];

/**
 * @typedef {object} SlackBlacklistEntry
 * @property {string} [namespace]
 * @property {string} [environment]
 * @property {string} [testFile]
 * @property {string} [testScope]
 * @property {string} [testId]
 * @property {string} reason
 * @property {string} [issue]
 */

/** @type {SlackBlacklistEntry[]} */
export const SLACK_BLACKLIST = [];

/**
 * Compare a single blacklist field against the value from the environment.
 *
 * @param {string} field Name of the blacklist field being compared.
 * @param {string} expected Value configured in the blacklist entry.
 * @param {string} actual Value of the corresponding env var, possibly undefined.
 * @returns {boolean} True when the field matches.
 */
function fieldMatches(field, expected, actual) {
    if (!actual) {
        return false;
    }

    // TESTFILENAME is a repo-relative path, so allow matching on the basename.
    if (field === "testFile") {
        return actual === expected || actual.endsWith("/" + expected);
    }

    return actual === expected;
}

/**
 * Check whether a single blacklist entry matches the current test run.
 *
 * Entries with unknown fields, or with no matchable fields at all, are ignored.
 * Without that guard a typo such as `test_file` would leave an entry with no
 * fields to match on, which would suppress every Slack message in the repo.
 *
 * @param {SlackBlacklistEntry} entry Blacklist entry to evaluate.
 * @returns {boolean} True when the entry matches the current test run.
 */
function entryMatches(entry) {
    const fields = Object.keys(entry);
    const unknown = fields.filter(
        (field) =>
            !MATCHABLE_FIELDS.includes(field) && !METADATA_FIELDS.includes(field),
    );

    if (unknown.length > 0) {
        console.error(
            `Slack blacklist: ignoring entry with unknown field(s): ${unknown.join(", ")}`,
        );
        return false;
    }

    const matchable = fields.filter((field) => MATCHABLE_FIELDS.includes(field));

    if (matchable.length === 0) {
        console.error(
            "Slack blacklist: ignoring entry with no matchable fields, as it would suppress every Slack message",
        );
        return false;
    }

    return matchable.every((field) =>
        fieldMatches(field, entry[field], __ENV[ENV_BY_FIELD[field]]),
    );
}

/**
 * Check whether the current test run should be kept out of Slack.
 *
 * Logs the matching entry so a suppressed message can still be traced in the
 * pod logs rather than looking like a silent failure to post.
 *
 * @param {SlackBlacklistEntry[]} blacklist Entries to match against, defaults to SLACK_BLACKLIST.
 * @returns {boolean} True when no Slack message should be sent.
 */
export function isBlacklisted(blacklist = SLACK_BLACKLIST) {
    const match = blacklist.find(entryMatches);

    if (!match) {
        return false;
    }

    console.log(
        `Slack message suppressed by blacklist (reason: ${match.reason || "not given"}): ` +
        `namespace=${__ENV.NAMESPACE}, environment=${__ENV.ENVIRONMENT}, ` +
        `testScope=${__ENV.TEST_SCOPE}, testFile=${__ENV.TESTFILENAME}`,
    );

    return true;
}
