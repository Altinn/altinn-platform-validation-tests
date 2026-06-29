/*
 * Publishes the two SKE consent resources (and their policies) into a test
 * environment so the two-resource consent test can run there.
 *
 *   - ske-samtykke-sbl-inntekt
 *   - ske-samtykke-sbl-summert-skattegrunnlag
 *
 * The resource definitions and XACML policies in this folder are copied
 * verbatim from production (tt02), EXCEPT the owner (hasCompetentAuthority),
 * which is overridden to the `ttd` test org below — you can only publish a
 * resource you own, and the publish token is a ttd enterprise token.
 *
 * Run (publishes to YT01):
 *   ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud \
 *   TOKEN_GENERATOR_USERNAME=*** TOKEN_GENERATOR_PASSWORD=*** \
 *   k6 run publish-ske-consent-resources.js
 *
 * Idempotency: re-running after the resources already exist will report a
 * non-201 on PostResource (already exists); the policy PUT is an upsert.
 */
import { check } from "k6";
import { ResourceRegistryApiClient } from "../../../../../clients/authentication/index.js";
import {
    EnterpriseTokenGenerator,
    EnterpriseTokenGeneratorOptions,
} from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";

// File contents are read at init time (open() is only available in init).
const resources = [
    {
        id: "ske-samtykke-sbl-inntekt",
        body: JSON.parse(open("./ske-samtykke-sbl-inntekt.json")),
        policy: open("./ske-samtykke-sbl-inntekt.policy.xml"),
    },
    {
        id: "ske-samtykke-sbl-summert-skattegrunnlag",
        body: JSON.parse(open("./ske-samtykke-sbl-summert-skattegrunnlag.json")),
        policy: open("./ske-samtykke-sbl-summert-skattegrunnlag.policy.xml"),
    },
];

export const options = {
    setupTimeout: "60s",
    scenarios: {
        default: { executor: "shared-iterations", vus: 1, iterations: 1 },
    },
};

// The ttd test org owns the published resources. OrgNo for ttd is 991825827
// except in yt01 where it is 713431400.
function ttdOrgNo(env) {
    return env === "yt01" ? "713431400" : "991825827";
}

function competentAuthority(env) {
    return {
        name: { en: "Test department", nb: "Testdepartementet", nn: "Testdepartementet" },
        organization: ttdOrgNo(env),
        orgcode: "ttd",
    };
}

let client;

function getClient() {
    if (client == undefined) {
        const tokenOpts = new EnterpriseTokenGeneratorOptions([
            ["env", __ENV.ENVIRONMENT],
            ["ttl", 3600],
            [
                "scopes",
                "altinn:resourceregistry/resource.write altinn:resourceregistry/resource.read altinn:resourceregistry/resource.admin",
            ],
        ]);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        client = new ResourceRegistryApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return client;
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
}

export default function () {
    const env = __ENV.ENVIRONMENT;
    const client = getClient();

    for (const resource of resources) {
        // Take ownership in the test env; let the registry assign the versionId.
        const body = Object.assign({}, resource.body, {
            hasCompetentAuthority: competentAuthority(env),
        });
        delete body.versionId;

        const resourceResp = client.PostResource(body, `post-resource:${resource.id}`);
        const resourceOk = check(resourceResp, {
            [`PostResource ${resource.id} - 201 Created`]: (r) => r.status === 201,
        });
        if (!resourceOk) {
            console.warn(
                `PostResource ${resource.id} returned ${resourceResp.status} (already exists?): ${resourceResp.body}`
            );
        } else {
            console.log(`Resource created: ${resource.id}`);
        }

        // Upload the policy regardless (PUT is an upsert), so an existing
        // resource still gets the correct policy.
        const policyResp = client.PostPolicy(resource.id, resource.policy, `post-policy:${resource.id}`);
        const policyOk = check(policyResp, {
            [`PostPolicy ${resource.id} - 200/201`]: (r) => r.status === 200 || r.status === 201,
        });
        if (!policyOk) {
            console.error(
                `PostPolicy ${resource.id} returned ${policyResp.status}: ${policyResp.body}`
            );
        } else {
            console.log(`Policy uploaded: ${resource.id}`);
        }
    }
}
