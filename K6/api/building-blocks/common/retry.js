import { sleep } from "k6";
import { Counter } from "k6/metrics";

/**
 * Counts requests that were retried because of a transient failure. Shows up in
 * the k6 summary as `transient_retries`, tagged with the building block label
 * and the status code that triggered the retry, so a run that only passed
 * thanks to retries is still visible in the output.
 */
const transientRetries = new Counter("transient_retries");

/**
 * Statuses that mean "the request never got a verdict from the API". k6 reports
 * client-side failures (socket exceptions, connection reset by peer, request
 * timeouts) as status 0 with `error_code`/`error` set.
 *
 * No building block expects any of these, which is why the retry does not need
 * to know what the caller does expect: anything in this list is a failure of the
 * environment rather than an answer worth asserting on.
 */
const TRANSIENT_STATUSES = [
    0, // k6 client-side error: socket exception, connection reset, timeout
    408, // Request Timeout
    429, // Too Many Requests
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
];

/**
 * Retries per request, on top of the original one, applied to every test that
 * goes through a wrapped building block.
 *
 * Not configurable on purpose, for now. The knob belongs to the run rather than
 * to the test file, since the same file is a smoke test under one config and a
 * performance test under another, and a performance run should not retry the
 * 503s that come from load shedding. That distinction is worth making once the
 * test config lives in this repo. Until then nobody is watching the breakpoint
 * runs, so a plain constant beats a knob nobody sets.
 */
const RETRIES = 3;

/**
 * Backoff before the first retry, doubling per retry up to `MAX_DELAY_SECONDS`.
 * With three retries that is 1s, 2s and 4s, so a request that never recovers
 * holds the iteration for seven seconds.
 */
const DELAY_SECONDS = 1;
const MAX_DELAY_SECONDS = 8;

/**
 * Sends a request and retries it while it fails transiently.
 *
 * Any response that is not in `TRANSIENT_STATUSES` is returned as it is, so the
 * building block stays the only place that decides which statuses it accepts. A
 * 400 where the building block expects 200 is a real failure and is returned on
 * the first attempt.
 *
 * The last response is always returned, so the building block's `check` calls
 * run exactly once regardless of how many tries it took.
 *
 * @param {() => import("k6/http").RefinedResponse} sendRequest
 * Sends the request. Called once per try.
 * @param {string} label Building block name, used in logs and metric tags.
 * @returns {import("k6/http").RefinedResponse} The last response received.
 */
export function withRetries(sendRequest, label) {
    let res = sendRequest();
    let used = 0;

    while (used < RETRIES && TRANSIENT_STATUSES.includes(res.status)) {
        const retry = used + 1;

        const delay = Math.min(
            DELAY_SECONDS * Math.pow(2, used),
            MAX_DELAY_SECONDS,
        );

        console.warn(
            `${label} - transient failure (status ${res.status}` +
                `${res.error_code ? `, error_code ${res.error_code}` : ""}` +
                `${res.error ? `, ${res.error}` : ""}). ` +
                `Retrying in ${delay}s (retry ${retry} of ${RETRIES}).`,
        );

        transientRetries.add(1, {
            building_block: label,
            status: `${res.status}`,
            retry: `${retry}`,
        });

        sleep(delay);

        res = sendRequest();
        used = retry;
    }

    if (used > 0) {
        const outcome = TRANSIENT_STATUSES.includes(res.status)
            ? `still failing transiently after ${used}`
            : `answered ${res.status} after ${used}`;

        console.info(`${label} - ${outcome} ${used === 1 ? "retry" : "retries"}.`);
    }

    return res;
}
