import { sleep } from "k6";

import { AltinnCdnClient } from "../../../../clients/altinn-cdn/index.js";
import { requireEnv } from "../../../../helpers.js";
import { checkCertificate } from "../../../domain-checks/common/tls.js";

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
        await checkCertificate(domain, { org, domain, deploy_env, });

        sleep(1);
    }
}
