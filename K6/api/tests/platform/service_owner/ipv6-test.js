import { check } from "k6";
import dns from "k6/x/dns";
import { sleep } from "k6";
import { AltinnCdnClient } from "../../../../clients/altinn-cdn/index.js";

import { checkIp } from "../../../../helpers.js";

export function setup() {
    const client = new AltinnCdnClient();
    const orgs = client.GetOrgs(__ENV.DEPLOY_ENV);
    let domains = [];
    for (let org of orgs) {
        domains.push(
            [
                org,
                __ENV.DEPLOY_ENV,
                client.GetDomainForOrgAndEnvironment(org, __ENV.DEPLOY_ENV)
            ]
        );
    }
    return domains;
}

export default async function (data) {
    console.log(`Querying ${data.length} domains`);
    for (let [org, deploy_env, domain] of data) {
        const tags = { "org": org, "domain": domain, "deploy_env": deploy_env };
        //const ipv4Results = await dns.resolve(domain, "A", "8.8.8.8:53");
        const ipv6Results = await dns.resolve(domain, "AAAA", "[2606:4700:4700::1111]:53");
        for (let ip of ipv6Results) {
            check(ip, { "Valid IPv6 address returned": (ip) => checkIp(ip), }, tags);
        }
        sleep(1);
    }
}
