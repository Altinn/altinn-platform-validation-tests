import { sleep } from "k6";

import { checkCertificate, domainsFromEnv } from "../../../domain-checks/common/tls.js";

/**
 * k6 setup stage. The domains access management is reached on.
 *
 * BASE_URL is the platform domain, which serves the access management API the
 * clients in clients/access-management call. Authentication and authorization
 * check the same certificate, and it is checked here as well so an expiring one
 * alerts the access management team too. AM_UI_BASE_URL is the am.ui domain, which
 * serves the frontend and its bff, the one the clients in
 * clients/access-management-bff call.
 *
 * @returns {string[]} The domains to check.
 */
export function setup() {
    return domainsFromEnv(["BASE_URL", "AM_UI_BASE_URL"]);
}

/**
 * Test: the TLS certificates on the domains access management is served from are valid and
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
