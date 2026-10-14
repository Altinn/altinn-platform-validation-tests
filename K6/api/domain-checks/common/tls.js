import { check } from "k6";
import tls from "k6/x/tls";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days before expiry at which a certificate starts failing the "expiring soon"
 * check, and with it the alert on the test, unless the test overrides it.
 */
export const DEFAULT_CERT_EXPIRY_WARNING_DAYS = 30;

/**
 * The warning window for this run.
 *
 * Teams renew on different schedules, so a test can set CERT_EXPIRY_WARNING_DAYS
 * in its yaml (`test_run.env`) to alert earlier or later than the default. A test
 * that wants a fixed window in code passes it to checkCertificate instead.
 *
 * @returns {number} Days before expiry at which the check starts failing.
 */
export function certExpiryWarningDays() {
    const raw = __ENV.CERT_EXPIRY_WARNING_DAYS;

    if (!raw) {
        return DEFAULT_CERT_EXPIRY_WARNING_DAYS;
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        console.error(
            `CERT_EXPIRY_WARNING_DAYS must be a number above 0, got "${raw}". ` +
            `Falling back to ${DEFAULT_CERT_EXPIRY_WARNING_DAYS}.`,
        );
        return DEFAULT_CERT_EXPIRY_WARNING_DAYS;
    }

    return parsed;
}

/**
 * Fetches the TLS certificate a domain serves and checks that it can be read, has
 * not expired and is not about to.
 *
 * The three checks are kept apart so the dashboard tells a broken lookup from an
 * expired certificate from one that only needs renewing. A failed lookup fails all
 * three, since nothing can be said about a certificate that was never read.
 *
 * Reaches for the k6/x/tls extension, so it only runs on a k6 binary that carries
 * it.
 *
 * Cross-area, like everything else in domain-checks/common, so it stays out of the
 * area barrels. Import it directly.
 *
 * @param {string} domain - Host name to connect to, without scheme or path.
 * @param {{[name: string]: string}} tags - Tags for the checks, at least what tells the domains apart.
 * @param {number} [warningDays] - Days before expiry at which the "expiring soon" check starts failing. Defaults to CERT_EXPIRY_WARNING_DAYS, or 30 when that is not set.
 */
export async function checkCertificate(domain, tags, warningDays = certExpiryWarningDays()) {
    let cert = null;
    let lookupSucceeded = false;

    try {
        cert = await tls.getCertificate(domain);
        lookupSucceeded = true;
    } catch (error) {
        console.error(
            `Failed to retrieve certificate for ${domain}: ${error}`,
        );
    }

    const now = Date.now();
    const warningMs = warningDays * DAY_MS;

    check(
        cert,
        {
            "certificate lookup succeeded": () => lookupSucceeded,
            "certificate is not expired": (c) => lookupSucceeded && c.expires > now,
            "certificate is not expiring soon": (c) => lookupSucceeded && c.expires - now > warningMs,
        },
        tags,
    );

    if (cert) {
        const expiresInDays = (cert.expires - now) / DAY_MS;

        console.log(
            `Certificate for ${domain} expires: ` +
            `${new Date(cert.expires).toISOString()} ` +
            `(${expiresInDays.toFixed(1)} days remaining)`,
        );
    }
}
