import http from "k6/http";
import { check } from "k6";
import { AltinnCdnClient } from "./client.js";

// https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#dns
export const options = {
    "dns": {
        policy: "preferIPv4", // 1 test with IPv4 and one with IPv6 preferIPv6
    }
};

export function setup() {
    const client = new AltinnCdnClient();
    const orgs = client.GetOrgs(__ENV.DEPLOY_ENV);
    let endpoints = [];
    for (let org of orgs) {
        endpoints.push(
            [
                org,
                __ENV.DEPLOY_ENV,
                `${client.GetBaseUrlForOrgInEnvironment(org, __ENV.DEPLOY_ENV)}/kuberneteswrapper/api/v1/deployments`
            ]
        );
    }
    return endpoints;
}

export default function (data) {
    console.log(`Querying ${data.length} endpoints`);
    for (let [org, deploy_env, endpoint] of data) {
        const tags = { "org": org, "url": endpoint, "deploy_env": deploy_env };
        const res = http.get(endpoint);
        check(res, { "HTTP version is valid": (res) => ["HTTP/1.1", "HTTP/2.0"].includes(res.proto), }, tags);
        check(res, { "response code was 200": (res) => res.status == 200, }, tags);
        const res_body = res.body;
        check(res_body, { "body contains kuberneteswrapper": (body) => body.includes("kuberneteswrapper") }, tags);
    }
}
