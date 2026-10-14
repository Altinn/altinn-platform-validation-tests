import { sleep } from "k6";

import { requireEnv } from "../../../../helpers.js";
import { checkCertificate, domainsFromEnv } from "../../../domain-checks/common/tls.js";

/**
 * k6 setup stage. The domains authentication is reached on.
 *
 * The platform domain, from BASE_URL, serves every authentication API the other
 * folders here test: the system register, system users, OpenID metadata,
 * introspection and token exchange. Maskinporten is not ours, but token exchange
 * and the system user token fail with it, so an expiring certificate there is
 * worth hearing about too. It has no env var of its own, so it is picked by
 * environment: production Maskinporten for prod, the test one everywhere else.
 *
 * @returns {string[]} The domains to check.
 */
export function setup() {
    requireEnv(["ENVIRONMENT"]);

    const maskinporten = __ENV.ENVIRONMENT === "prod" ? "maskinporten.no" : "test.maskinporten.no";

    return [...domainsFromEnv(["BASE_URL"]), maskinporten];
}

/**
 * Test: the TLS certificates on the domains authentication is served from are valid and
 * not about to expire.
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
