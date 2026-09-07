import { check, group } from "k6";
import exec from "k6/execution";

import { CreateInstanceRightsQueryBuilder, InstanceRightsDelegationDtoBuilder } from "../../../../clients/access-management-bff/instance/index.js";
import { GetRightsMetaQueryBuilder } from "../../../../clients/access-management-bff/single-right/index.js";
import { uuidv4 } from "../../../../common-imports.js";
import { fetchTestData, getNumberOfVUs, requireEnv, segmentData } from "../../../../helpers.js";
import { CreateInstanceRights } from "../../../building-blocks/access-management-bff/instance/index.js";
import { GetRightsMeta } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { getAuthorizeClient } from "../../authorization/authorize-client.js";
import { buildInstanceRequest } from "../../authorization/pdp-authorize/common-functions.js";
import { getClients, getFromTo, getTokenOpts } from "./commons.js";

/**
 * Reproduction for the PDP cache race described in
 * https://github.com/Altinn/altinn-platform-validation-tests/issues/532,
 * with Dialogporten out of the loop entirely.
 *
 * Each VU delegates instance rights on a synthetic instance id (no real dialog)
 * on its own dedicated resource, one of the ten "k6-multiresource-test-01".."-10"
 * created for this purpose, never shared with another VU. Right after, it asks
 * the PDP directly whether the delegation took effect. With one VU this always
 * comes back Permit; with several VUs running concurrently, some come back
 * NotApplicable even though the delegation just succeeded, which is the bug.
 *
 * Needs the ten resources to already exist and be published (status Active) in
 * whatever environment this runs against. They were created once as a one-off
 * in at23 and tt02.
 */
const resources = [
    "k6-multiresource-test-01",
    "k6-multiresource-test-02",
    "k6-multiresource-test-03",
    "k6-multiresource-test-04",
    "k6-multiresource-test-05",
    "k6-multiresource-test-06",
    "k6-multiresource-test-07",
    "k6-multiresource-test-08",
    "k6-multiresource-test-09",
    "k6-multiresource-test-10",
];

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "AM_UI_BASE_URL", "AUTHORIZATION_SUBSCRIPTION_KEY"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management-bff/instance-delegation/${__ENV.ENVIRONMENT}/org-user.csv`);
    return segmentData(data, numberOfVUs);
}

/**
 * @param {any[][]} data Organizations with their daglig leder, one slice per VU.
 */
export default function (data) {
    const { instance: instanceApiClient, singleRight: singleRightApiClient, tokenGenerator } = getClients();
    const [authorizeClient] = getAuthorizeClient();
    const resource = resources[exec.vu.idInTest - 1];
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    // Not a real dialog or any other real object, just a value in one of the
    // three URN formats the instance parameter is validated against. It never
    // gets checked against anything, so a made-up uuid works fine, and the
    // generic instance-id prefix avoids implying Dialogporten is involved.
    const instanceId = `urn:altinn:instance-id:${uuidv4()}`;

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    const rightsMeta = GetRightsMeta(
        singleRightApiClient,
        new GetRightsMetaQueryBuilder().withResource(resource).build(),
    );

    CreateInstanceRights(
        instanceApiClient,
        new CreateInstanceRightsQueryBuilder()
            .withParty(from.orgUuid)
            .withResource(resource)
            .withInstance(instanceId)
            .build(),
        new InstanceRightsDelegationDtoBuilder()
            .withTo({ personIdentifier: to.ssn, lastName: to.lastName })
            .withDirectRightKeys((rightsMeta ?? []).map((r) => r.key).filter((k) => k !== null))
            .build(),
    );

    group("The mottaker actually gets the access just delegated", function () {
        const request = buildInstanceRequest({
            toSsn: to.ssn,
            fromOrg: from.orgNo,
            resourceId: resource,
            instanceId,
            action: "read",
        });

        // Raw call, bypassing the AuthorizePost building block, so the console
        // shows the exact HTTP status and full response body the PDP returned,
        // not just the parsed decision.
        const res = authorizeClient.AuthorizePost(request);

        console.log(`RESULT resource=${resource} instanceId=${instanceId} vu=${exec.vu.idInTest} iter=${exec.vu.iterationInInstance} from.orgNo=${from.orgNo} to.ssn=${to.ssn} httpStatus=${res.status} body=${res.body}`);

        const decision = res.status === 200 ? JSON.parse(res.body)?.response?.[0]?.decision : null;

        check(res, {
            "PDP decision is Permit for the party it was just delegated to": () => decision === "Permit",
        });
    });
}
