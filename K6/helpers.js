import { sleep, check } from "k6";
import exec from 'k6/execution';
import { papaparse, randomItem } from "./commonImports.js";

/**
 * Retry a function until it succeeds or all retries fail.
 *
 * Uses `check()` to report pass/fail instead of throwing.
 *
 * @param {Function} conditionFn - Function that returns true on success, false otherwise.
 * @param {Object} options - Retry settings.
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

            console.log(`${testscenario}] Attempt ${attempt}/${retries} — condition not met, retrying...`);
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
    return parseCsvData(open(filename))
}
/**
 *
 * @returns A random item from the list, or an item based on __ITER if randomize is false
 */
export function getItemFromList(listOfItems, randomize = false) {
    if (randomize) {
        return randomItem(listOfItems)
    }
    else {
        return listOfItems[__ITER % listOfItems.length]
    };
}

/**
 * Divide the list of items into multiple sublists
 * e.g. listOfItems = [1, 2, 3, 4, 5, 6, 7, 8, 9] and numberOfSublists = 3, output = [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ]
 * e.g. listOfItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] and numberOfSublists = 3, output = [ [0, 1, 2, 3], [4, 5, 6], [7, 8, 9] ]
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

    return sublists
}

/**
 * An attempt to abstract finding the number of VUs. Current implementation is a bit restrictive/opinionated but we can build upon.
 * @returns The number of VUs for the test
*/
export function getNumberOfVUs() {
    return exec.test.options.scenarios.default.vus ?? __ENV.BREAKPOINT_STAGE_TARGET ?? 1;
}

/**
 * Function to get k6 options based on labels.
 * @param {} labels
 * @returns
 */
export function getOptions(labels) {
    const options = {
        summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
        // Placeholder, will be populated below
        thresholds: {}
    };

    // Set labels with empty arrays to collect stats.
    for (const label of labels) {
        options.thresholds[`http_req_duration{name:${label}}`] = [];
        options.thresholds[`http_req_failed{name:${label}}`] = [];
        options.thresholds[`http_reqs{name:${label}}`] = [];
    }

    return options;
}