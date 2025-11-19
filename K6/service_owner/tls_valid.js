import tls from "k6/x/tls";
import { check } from "k6";

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
export default async function (data) {

    console.log(`Querying ${data.length} domains`);
    for (let [org, deploy_env, domain] of data) {
        const tags = { "org": org, "domain": domain, "deploy_env": deploy_env };
        // TODO expose how long until cert is expired
        const cert = await tls.getCertificate(domain);
        check(cert, {
            "certificate is not expired": (c) => c.expires > Date.now(),
        }, tags);
        console.log(`Certificate for ${domain} expires: ${new Date(cert.expires)}`);
        sleep(1);
    }
}
