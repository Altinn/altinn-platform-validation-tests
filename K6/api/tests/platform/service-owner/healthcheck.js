import { check } from "k6";
import http from "k6/http";

import { AltinnCdnClient } from "../../../../clients/altinn-cdn/index.js";
import { requireEnv } from "../../../../helpers.js";
import { withRetries } from "../../../building-blocks/common/retry.js";

// https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#dns
export const options = {
    "dns": {
        policy: "preferIPv4", // 1 test with IPv4 and one with IPv6 preferIPv6
    },
};

export function setup() {
    requireEnv(["DEPLOY_ENV"]);

    const client = new AltinnCdnClient();
    const orgs = client.GetOrgs(__ENV.DEPLOY_ENV);

    return orgs.map((org) => [
        org,
        __ENV.DEPLOY_ENV,
        `${client.GetBaseUrlForOrgInEnvironment(
            org,
            __ENV.DEPLOY_ENV,
        )}/kuberneteswrapper/api/v1/deployments`,
    ]);
}

/**
 * @param {ReturnType<typeof setup>} data Test data from setup.
 */
export default function (data) {
    console.log(`Querying ${data.length} endpoints`);

    for (const [org, deploy_env, endpoint] of data) {
        const tags = { org, endpoint, deploy_env, };

        const params = { tags, };

        let res = null;

        try {
            res = withRetries(() => http.get(endpoint, params), org);
        } catch (e) {
            console.error(`${org} - request failed unexpectedly: ${e}`);
        }

        check(
            res,
            {
                "HTTP request succeeded": (response) =>
                    response != null && response.status !== 0,

                "HTTP version is valid": (response) =>
                    response != null &&
                    response.status !== 0 &&
                    ["HTTP/1.1", "HTTP/2.0"].includes(response.proto),

                "response code was 200": (response) =>
                    response != null && response.status === 200,

                "body contains kuberneteswrapper": (response) =>
                    response != null &&
                    response.status === 200 &&
                    typeof response.body === "string" &&
                    response.body.includes("kuberneteswrapper"),
            },
            tags,
        );
    }
}
