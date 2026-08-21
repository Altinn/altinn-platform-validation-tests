import runHealthcheck, { setup as setupHealthcheck } from "./healthcheck.js";
import runIpv4Test, { setup as setupIpv4Test } from "./ipv4-test.js";
import runIpv6Test, { setup as setupIpv6Test } from "./ipv6-test.js";
import runTlsValid, { setup as setupTlsValid } from "./tls-valid.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        healthcheck: setupHealthcheck(),
        ipv4Test: setupIpv4Test(),
        ipv6Test: setupIpv6Test(),
        tlsValid: setupTlsValid(),
    };
}

/**
 * The TLS test reaches for the k6/x/tls extension, so this file only runs on a k6
 * binary that carries it. Plain k6 refuses the whole folder rather than skipping
 * the one test, which is the honest outcome: a skipped TLS check reads as a pass.
 */

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default async function (data) {
    runHealthcheck(data.healthcheck);
    await runIpv4Test(data.ipv4Test);
    await runIpv6Test(data.ipv6Test);
    await runTlsValid(data.tlsValid);
}
