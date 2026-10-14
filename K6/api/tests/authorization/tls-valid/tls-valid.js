import { sleep } from "k6";

import { checkCertificate, domainsFromEnv } from "../../../domain-checks/common/tls.js";

/**
 * k6 setup stage. The domains authorization is reached on.
 *
 * The pdp and the rest of the authorization API sit under the platform domain, from
 * BASE_URL, the same one authentication uses. It is checked here as well so an
 * expiring certificate alerts the authorization team, not only authentication.
 *
 * @returns {string[]} The domains to check.
 */
export function setup() {
    return domainsFromEnv(["BASE_URL"]);
}

/**
 * Test: the TLS certificates on the domains authorization is served from are valid and
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
