import http from "k6/http";
import { check } from "k6";

// https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#dns
export const options = {
    "dns": {
        policy: "preferIPv4", // 1 test with IPv4 and one with IPv6 preferIPv6
    }
};

export function setup() {
    const endpoints = [];
    const url = __ENV.ALTINN_CDN_URL;
    const res = http.get(url);
    if (res.status == 200) {
        const res_body = JSON.parse(res.body);

        for (let [org, meta] of Object.entries(res_body["orgs"])) {
            if (meta.environments.length > 0) {
                for (let env of meta.environments) {
                    if (env == "tt02" && __ENV.DEPLOY_ENV == "tt02") {
                        endpoints.push([
                            org, "tt02", `https://${org}.apps.tt02.altinn.no/kuberneteswrapper/api/v1/deployments`
                        ]);
                    } else if (env == "production" && __ENV.DEPLOY_ENV == "prod") {
                        endpoints.push([
                            org, "prod", `https://${org}.apps.altinn.no/kuberneteswrapper/api/v1/deployments`]
                        );
                    }
                }
            }
        }
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
