import { sleep } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { checkCertificate } from "../../../domain-checks/common/tls.js";

/**
 * The hosts authorization is reached on, per environment.
 *
 * The pdp and the rest of the authorization API sit under the platform host, the
 * same one authentication uses. It is checked here as well so an expiring
 * certificate alerts the authorization team, not only authentication.
 *
 * Listed by hand rather than read from BASE_URL, since prod has no BASE_URL of its
 * own here.
 *
 * @type {{[environment: string]: string[]}}
 */
const DOMAINS_BY_ENVIRONMENT = {
    at22: ["platform.at22.altinn.cloud"],
    at23: ["platform.at23.altinn.cloud"],
    yt01: ["platform.yt01.altinn.cloud"],
    tt02: ["platform.tt02.altinn.no"],
    prod: ["platform.altinn.no"],
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
            `No authorization domains listed for environment "${__ENV.ENVIRONMENT}". ` +
            `Known: ${Object.keys(DOMAINS_BY_ENVIRONMENT).join(", ")}`,
        );
    }

    return domains;
}

/**
 * Test: the TLS certificates on the hosts authorization is served from are valid
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
