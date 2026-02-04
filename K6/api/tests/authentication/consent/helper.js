import { randomItem } from "../../../../common-imports.js";

/**
 * Select (and cache) a random from/to pair from test data.
 *
 * @param {any[]} data
 * @param {any | undefined} from
 * @param {any | undefined} to
 * @returns {[any, any]} [from, to]
 */
export function selectRandomFromToPair(data, from, to) {
    if (!from || !to) {
        from = randomItem(data);
        // Make sure to and from are not the same
        do {
            to = randomItem(data);
        } while (to === from);
    }
    console.log("from", from?.ssn, "to", to?.orgNo);
    return [from, to];
}
