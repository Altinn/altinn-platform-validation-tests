import { check } from "k6";
import tls from "k6/x/tls";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days before expiry at which a certificate starts failing the "expiring soon"
 * check, and with it the alert on the test.
 */
export const CERT_EXPIRY_WARNING_DAYS = 30;

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
 */
export async function checkCertificate(domain, tags) {
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

    check(
        cert,
        {
            "certificate lookup succeeded": () => lookupSucceeded,
            "certificate is not expired": (c) => lookupSucceeded && c.expires > now,
            "certificate is not expiring soon": (c) => lookupSucceeded && c.expires - now > CERT_EXPIRY_WARNING_DAYS * DAY_MS,
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
