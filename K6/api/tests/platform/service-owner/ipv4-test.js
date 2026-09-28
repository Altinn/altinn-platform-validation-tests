import { check } from "k6";
import { sleep } from "k6";
import dns from "k6/x/dns";

import { AltinnCdnClient } from "../../../../clients/altinn-cdn/index.js";
import { checkIp, requireEnv } from "../../../../helpers.js";

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

        let ipv4Results = null;
        let lookupSucceeded = false;

        try {
            ipv4Results = await dns.resolve(domain, "A", "8.8.8.8:53");
            lookupSucceeded = true;
        } catch (e) {
            console.error(`${domain} - DNS lookup failed: ${e}`);
        }
        check(
            ipv4Results,
            {
                "DNS lookup succeeded": () => lookupSucceeded,

                "Valid IPv4 address returned": (ips) =>
                    Array.isArray(ips) &&
                    ips.length > 0 &&
                    ips.every((ip) => checkIp(ip)),
            },
            tags,
        );

        if (lookupSucceeded) {
            console.log(
                `${domain} - IPv4 addresses: ${ipv4Results.join(", ")}`,
            );
        }

        sleep(1);
    }
}
