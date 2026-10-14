import { sleep } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { checkCertificate } from "../../../domain-checks/common/tls.js";

/**
 * The hosts authentication is reached on, per environment.
 *
 * The platform host serves every authentication API the other folders here test:
 * the system register, system users, OpenID metadata, introspection and token
 * exchange. Maskinporten is not ours, but token exchange and the system user token
 * fail with it, so an expiring certificate there is worth hearing about too.
 *
 * Listed by hand rather than read from BASE_URL, since prod has no BASE_URL of its
 * own here and Maskinporten is not under it either.
 *
 * @type {{[environment: string]: string[]}}
 */
const DOMAINS_BY_ENVIRONMENT = {
    at22: ["platform.at22.altinn.cloud", "test.maskinporten.no"],
    at23: ["platform.at23.altinn.cloud", "test.maskinporten.no"],
    yt01: ["platform.yt01.altinn.cloud", "test.maskinporten.no"],
    tt02: ["platform.tt02.altinn.no", "test.maskinporten.no"],
    prod: ["platform.altinn.no", "maskinporten.no"],
};

/**
 * k6 setup stage. Picks the domains for the environment under test, and fails the
 * run when there are none, since a run that checks nothing reads as a pass.
 *
 * @returns {string[]} The domains to check.
 */
export function setup() {
    requireEnv(["ENVIRONMENT"]);

    const domains = DOMAINS_BY_ENVIRONMENT[__ENV.ENVIRONMENT];

    if (!domains) {
        throw new Error(
            `No authentication domains listed for environment "${__ENV.ENVIRONMENT}". ` +
            `Known: ${Object.keys(DOMAINS_BY_ENVIRONMENT).join(", ")}`,
        );
    }

    return domains;
}

/**
 * Test: the TLS certificates on the hosts authentication is served from are valid
 * and not about to expire.
 *
 * Same checks as platform/service-owner/tls-valid.js, so a certificate inside the
 * warning window fails "certificate is not expiring soon" and alerts the same way.
 *
 * @param {ReturnType<typeof setup>} domains Test data from setup.
 */
export default async function (domains) {
    for (const domain of domains) {
        await checkCertificate(domain, { domain, deploy_env: __ENV.ENVIRONMENT });

        sleep(1);
    }
}
