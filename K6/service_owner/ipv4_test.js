import { check } from "k6";
import dns from "k6/x/dns";
import { sleep } from "k6";
import { AltinnCdnClient } from "./client.js";

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

// https://www.geeksforgeeks.org/javascript/how-to-check-if-a-string-is-a-valid-ip-address-format-in-javascript/
// Has some problems but should work for a simple test.
function checkIp(ip) {
    const ipv4 =
        /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6 =
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4.test(ip) || ipv6.test(ip);
}

export default async function (data) {
    console.log(`Querying ${data.length} domains`);
    for (let [org, deploy_env, domain] of data) {
        const tags = { "org": org, "domain": domain, "deploy_env": deploy_env };
        const ipv4Results = await dns.resolve(domain, "A", "8.8.8.8:53");
        for (let ip of ipv4Results) {
            check(ip, { "Valid IPv4 address returned": (ip) => checkIp(ip), }, tags);
        }
        sleep(1);
    }
}
