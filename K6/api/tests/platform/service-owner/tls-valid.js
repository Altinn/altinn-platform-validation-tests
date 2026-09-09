import { check } from "k6";
import { sleep } from "k6";
import tls from "k6/x/tls";

import { AltinnCdnClient } from "../../../../clients/altinn-cdn/index.js";
import { requireEnv } from "../../../../helpers.js";

const CERT_EXPIRY_WARNING_DAYS = 30;
const CERT_EXPIRY_WARNING_MS = CERT_EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;

export function setup() {
    requireEnv(["DEPLOY_ENV"]);

    const client = new AltinnCdnClient();
    const orgs = client.GetOrgs(__ENV.DEPLOY_ENV);

    return orgs.map((org) => [
        org,
        __ENV.DEPLOY_ENV,
        client.GetDomainForOrgAndEnvironment(org, __ENV.DEPLOY_ENV),
    ]);
}

/**
 * @param {ReturnType<typeof setup>} data Test data from setup.
 */
export default async function (data) {
    console.log(`Querying ${data.length} domains`);

    for (const [org, deploy_env, domain] of data) {
        const tags = { org, domain, deploy_env, };

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
                "certificate is not expiring soon": (c) => lookupSucceeded && c.expires - now > CERT_EXPIRY_WARNING_MS,
            },
            tags,
        );

        if (cert) {
            const expiresInDays = (cert.expires - now) / (24 * 60 * 60 * 1000);

            console.log(
                `Certificate for ${domain} expires: ` +
                `${new Date(cert.expires).toISOString()} ` +
                `(${expiresInDays.toFixed(1)} days remaining)`,
            );
        }

        sleep(1);
    }
}
