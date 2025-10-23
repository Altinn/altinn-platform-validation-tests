import { sleep, check } from "k6";
import exec from 'k6/execution';
import { papaparse, randomItem, randomIntBetween } from "./commonImports.js";

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

export function readCsv(filename) {
    try {
        return papaparse.parse(open(filename), { header: true, skipEmptyLines: true }).data;
    } catch (error) {
        console.log(`Error reading CSV file: ${error}`);
        return [];
    }
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
 * Divide the list of items among the VUs, and return either a random item from that subset, or an item based on __ITER
 * Weakness: If the number of VUs is greater than the number of items in the list, some VUs will get the same item
 *           If we have 3 VUs and 10 items, VU1 gets items 1-4, VU2 gets items 5-8, VU3 gets items 9-10. Ideally VU1 should get 1-4, VU2 gets 5-7, VU3 gets 8-10
 * @returns A random item from the list, or an item based on __ITER if randomize is false
 */
export function getItemFromListDividedPerVu(listOfItems, randomize = false) {
  // For a normal test, total vus is taken from exec.test.options.scenarios.default.vus
  // For a breakpoint test, total vus is taken from __ENV.BREAKPOINT_STAGES_TARGET
  // If neither is set, default to 1, all vus will pick from the entire list
  const totalVus = exec.test.options.scenarios.default.vus ?? __ENV.BREAKPOINT_STAGES_TARGET ?? 1;
  const noOfItemsPerVu = Math.ceil(listOfItems.length / totalVus);
  const startIx = (noOfItemsPerVu * (exec.vu.idInTest - 1)) % listOfItems.length;  
  const endIx = Math.min((startIx + noOfItemsPerVu -1), listOfItems.length -1);
  if (randomize) {
      return listOfItems[randomIntBetween(startIx, endIx)]
  }
  else {
      return listOfItems[startIx + (__ITER % (endIx - startIx + 1))]
  };
}