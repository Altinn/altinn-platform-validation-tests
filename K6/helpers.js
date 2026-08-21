import { check, fail, sleep } from "k6";
import exec from "k6/execution";
import http from "k6/http";
import { Counter } from "k6/metrics";

import { withRetries } from "./api/building-blocks/common/retry.js";
import { papaparse, randomItem } from "./common-imports.js";

/**
 * Counts test data reads that came up short. Shows up in the k6 summary and in
 * Grafana as `test_data_fetch_failures`, tagged with the file that was read and
 * why it failed, so a run that fell over on its test data says so in the metrics
 * rather than only in the log.
 *
 * A read that worked adds 0 instead of adding nothing, so the series exists on a
 * healthy run too. Without that a dashboard cannot tell "nothing failed" from
 * "this test never ran", and an alert on the metric has nothing to sit on until
 * the first failure.
 */
const testDataFetchFailures = new Counter("test_data_fetch_failures");

/**
 * Records the outcome of one test data read.
 *
 * @param {string} file The file that was read, as the caller named it.
 * @param {string} [reason] Why the read failed, or omitted when it worked.
 * @returns {void}
 */
function recordTestDataFetch(file, reason = null) {
    testDataFetchFailures.add(reason ? 1 : 0, { file, reason: reason ?? "none" });
}

/**
 * Retry a function until it succeeds or all retries fail.
 *
 * Uses `check()` to report pass/fail instead of throwing.
 *
 * @param {Function} conditionFn - Function that returns true on success, false otherwise.
 * @param {object} options - Retry settings.
 * @param {number} options.retries - How many times to retry (default 10).
 * @param {number} options.intervalSeconds - Seconds between attempts (default 5).
 * @param {string} options.testscenario - Prefix used in log/check output.
 * @returns {boolean} - true if success within retry limit, false otherwise.
 */
export function retry(conditionFn, options = {}) {
    const {
        retries = 10,
        intervalSeconds = 5,
        testscenario = "retry check",
    } = options;

    let success = false;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = conditionFn();

            if (result) {
                console.log(`${testscenario}] condition met on attempt ${attempt}`);
                success = true;
                break;
            }

            console.log(
                `${testscenario}] Attempt ${attempt}/${retries} — condition not met, retrying...`
            );
        } catch (err) {
            console.warn(`${testscenario}: Error on attempt ${attempt}:`);
        }

        if (attempt < retries) {
            sleep(intervalSeconds);
        }
    }

    check(success, {
        [`${testscenario} succeeded within ${retries} retries`]: (s) => s === true,
    });

    return success;
}

export function parseCsvData(data) {
    return papaparse.parse(data, { header: true, skipEmptyLines: true }).data;
}

export function readCsv(filename) {
    return parseCsvData(open(filename));
}
/**
 *
 * @template T
 * @param {T[]} listOfItems TODO: description
 * @param {boolean} randomize TODO: description
 * @returns {T} A random item from the list, or an item based on __ITER if randomize is false
 */
export function getItemFromList(listOfItems, randomize = false) {
    if (randomize) {
        return randomItem(listOfItems);
    } else {
        return listOfItems[__ITER % listOfItems.length];
    }
}

/**
 * Divide the list of items into multiple sublists
 * e.g. listOfItems = [1, 2, 3, 4, 5, 6, 7, 8, 9] and numberOfSublists = 3, output = [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ]
 * e.g. listOfItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] and numberOfSublists = 3, output = [ [0, 1, 2, 3], [4, 5, 6], [7, 8, 9] ]
 *
 * @param listOfItems TODO: description
 * @param numberOfSublists TODO: description
 * @returns A list with numberOfSublists lists.
 */
export function segmentData(listOfItems, numberOfSublists = 1) {
    const sublists = [];
    const itemsPerSublist = Math.floor(listOfItems.length / numberOfSublists);
    const remainder = listOfItems.length % numberOfSublists;

    let index = 0;
    for (let i = 0; i < numberOfSublists; i++) {
        const sublistSize = itemsPerSublist + (i < remainder ? 1 : 0);
        sublists.push(listOfItems.slice(index, index + sublistSize));
        index += sublistSize;
    }

    return sublists;
}

/**
 * An attempt to abstract finding the number of VUs. Current implementation is a bit restrictive/opinionated but we can build upon.
 *
 * @returns The number of VUs for the test
 */
export function getNumberOfVUs() {
    return (
        exec.test.options.scenarios.default.vus ??
        __ENV.BREAKPOINT_STAGE_TARGET ??
        1
    );
}

/**
 * Function to get k6 options based on labels.
 *
 * @param {{ [key: string]: string }[]} labels - Array of label objects (key/value pairs)
 * @param {string[]} groups - list of strings
 * @returns {object} TODO: description
 */
export function getOptions(labels, groups = []) {
    const options = {
        summaryTrendStats: ["avg", "min", "med", "max", "p(95)", "p(99)", "count"],
        // Placeholder, will be populated below
        thresholds: {},
    };

    // Set labels with empty arrays to collect stats.
    for (let label of labels) {
        for (let [key, value] of Object.entries(label)) {
            options.thresholds[`http_req_duration{${key}:${value}}`] = [];
            options.thresholds[`http_req_failed{${key}:${value}}`] = [];
            options.thresholds[`http_reqs{${key}:${value}}`] = [];
        }
    }

    for (const group of groups) {
        options.thresholds[`http_req_duration{group:::${group}}`] = [];
    }
    return options;
}

export function checkIp(ip) {
    const ipv4 =
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6 =
        /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4})$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,5}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,6}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;

    return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Ensures required environment variables exist.
 *
 * @param {string[]} vars - Array of environment variable names
 * @returns {object} key-value map of env vars
 */
export function requireEnv(vars) {
    const missing = [];
    const result = {};

    for (const name of vars) {
        const value = __ENV[name];

        if (value === undefined || value === "") {
            missing.push(name);
        } else {
            result[name] = value;
        }
    }

    if (missing.length > 0) {
        // Fail the test immediately with a clear message
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }

    return result;
}

/**
 * Picks a specified number of unique random items from a list.
 * Each selected item is removed from the pool before the next pick,
 * ensuring no duplicates are returned.
 *
 * @param {Array<any>} list - The source array to pick items from.
 * @param {number} count - The number of unique items to select.
 * @returns {Array<any>} An array containing the randomly selected unique items.
 * @throws {Error} If `count` is greater than the size of the list.
 * @example
 * const [from, to, user] = pickUnique(users, 3);
 */
export function pickUnique(list, count) {
    if (count > list.length) {
        throw new Error("Cannot pick more unique items than exist in the list");
    }

    const copy = [...list];
    const result = [];

    for (let i = 0; i < count; i++) {
        const item = getItemFromList(copy, true);
        result.push(item);
        copy.splice(copy.indexOf(item), 1);
    }

    return result;
}

/**
 * Reads one of the test data files over HTTP.
 *
 * A missing file answers 404, and a body that parses into an empty list would only
 * surface later as an undefined row somewhere in the test. Renaming or moving a
 * file is enough to cause that, since the read is pinned to main, so this fails on
 * the spot and names the URL that came up short. Pass failOnDataFetchingFailure as
 * false for a caller that would rather handle empty data itself.
 *
 * Every read reports to `test_data_fetch_failures`, so a broken read is visible
 * in Grafana and not only in the log of whoever happened to watch the run.
 *
 * A .csv comes back as rows, a .json as whatever it holds, and a .txt as its
 * non-empty lines, trimmed. Any other extension is refused rather than handed back
 * as a string, so a caller that meant to read a format nobody parses hears about it
 * here.
 *
 * @param {string} filename File name under the test data directory, or an absolute URL.
 * @param {boolean} failOnDataFetchingFailure Whether the test should fail when fetching fails.
 * @param {string} branch Branch to read test data from. Defaults to "main".
 * The shape depends on the file the caller asked for, which is why this says
 * `any` rather than a union nobody could narrow: a caller reads the columns its
 * own fixture has.
 * @returns {any} The parsed test data.
 */
export function fetchTestData(
    filename,
    failOnDataFetchingFailure = true,
    branch = "main",
) {
    const testDataBaseUrl =
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/${branch}/K6/testdata`;
    const url = filename.startsWith("http")
        ? filename
        : `${testDataBaseUrl}/${filename}`;

    const res = withRetries(
        () => http.get(url, { tags: { action: "fetch-test-data" } }),
        "fetch-test-data",
    );

    if (res.status !== 200) {
        recordTestDataFetch(filename, `status-${res.status}`);

        const message = `Cannot read test data: ${url} returned ${res.status}`;

        if (failOnDataFetchingFailure) {
            fail(message);
        }

        return [];
    }

    if (filename.endsWith(".csv")) {
        const rows = parseCsvData(res.body);

        recordTestDataFetch(filename, rows.length === 0 ? "empty" : null);

        if (rows.length === 0 && failOnDataFetchingFailure) {
            fail(`Cannot read test data: ${url} contains no rows`);
        }

        return rows;
    }

    if (filename.endsWith(".json")) {
        try {
            const parsed = JSON.parse(res.body);

            recordTestDataFetch(filename);

            return parsed;
        } catch (error) {
            recordTestDataFetch(filename, "unparseable");

            if (failOnDataFetchingFailure) {
                fail(`Cannot parse test data: ${url}. Error: ${error}`);
            }

            return [];
        }
    }

    if (filename.endsWith(".txt")) {
        const lines = res.body
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        recordTestDataFetch(filename, lines.length === 0 ? "empty" : null);

        if (lines.length === 0 && failOnDataFetchingFailure) {
            fail(`Cannot read test data: ${url} contains no lines`);
        }

        return lines;
    }

    recordTestDataFetch(filename, "unsupported-file-type");

    const message = `Unsupported test data file type: ${url}`;

    if (failOnDataFetchingFailure) {
        fail(message);
    }

    return [];
}
