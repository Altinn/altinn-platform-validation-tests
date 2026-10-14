import runTlsValid, { setup as setupTlsValid } from "./tls-valid.js";

/**
 * k6 setup stage.
 *
 * @returns One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        tlsValid: setupTlsValid(),
    };
}

/**
 * Runs every test in this folder once.
 *
 * Kept out of authentication/run-all.js on purpose: the TLS test reaches for the
 * k6/x/tls extension, and plain k6 would refuse the whole authentication run over it.
 *
 * @param {any} data Setup results, keyed per setup.
 */
export default async function (data) {
    await runTlsValid(data.tlsValid);
}
