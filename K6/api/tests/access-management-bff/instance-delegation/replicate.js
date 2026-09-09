import { fail } from "k6";
import exec from "k6/execution";

import {
    CreateInstanceRightsQueryBuilder,
} from "../../../../clients/access-management-bff/instance/index.js";
import { GetRightsMetaQueryBuilder } from "../../../../clients/access-management-bff/single-right/index.js";
import { DialogByIdVariablesBuilder, DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/index.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, requireEnv, segmentData } from "../../../../helpers.js";
import { CreateInstanceRights } from "../../../building-blocks/access-management-bff/instance/index.js";
import { GetRightsMeta } from "../../../building-blocks/access-management-bff/single-right/index.js";
import { GetAllDialogsForPartyCheckForDialogId, GetAndVerifyDialogById } from "../../../building-blocks/dialogporten/graphql/index.js";
import { CreateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients, getDialogportenOpts, getFromTo, getInstanceDelegationBody, getTokenOpts, SERVICE_OWNER_ORG_NO } from "./commons.js";

// List of resources to test with. Use only one for now,
// make sure to have the resource created in the environment before running the test, and that the service owner owns it,
// and that it is delegable (see the "delegable" property when getting the resource by id in the access management API).
const resources = [
    "k6-instancedelegation-test",
];

/**
 * Setup function to segment data for VUs.
 *
 * @returns {any[][]} Organizations with their daglig leder, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management-bff/instance-delegation/${__ENV.ENVIRONMENT}/org-user.csv`, true, "repro-instance-delegation-pdp-race");
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function to test instance delegation from user to user.
 * The test will create a dialog, then delegate it to another user,
 * and check that the delegation is successful by calling the same endpoints as
 * the browser would do when navigating in the access management UI.
 * Finally, check that the delegated dialog is visible for the delegated user
 * by using the dialogporten graphql API to get the dialog by id.
 * (The groups are not used for anything else than to be able to see the flow of the test)
 *
 * @param {any[][]} data Organizations with their daglig leder, one slice per VU.
 */
export default function (data) {
    const {
        serviceOwner: serviceOwnerApiClient,
        instance: instanceApiClient,
        singleRight: singleRightApiClient,
        graphql: graphqlClient,
        tokenGenerator,
    } = getClients();
    const { from, to } = getFromTo(data[exec.vu.idInTest - 1]);
    const resource = getItemFromList(resources);
    // create a dialog to have an instance to delegate on, and to be able to test with a realistic instance in the access management API

    const dialogId = CreateDialog(
        serviceOwnerApiClient,
        from.orgNo,
        resource,
        SERVICE_OWNER_ORG_NO,
        null,
        false,
    );

    if (dialogId === null) {
        fail("cannot delegate on an instance: creating the dialog returned no dialog id");
    }

    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    const rightsMeta = GetRightsMeta(
        singleRightApiClient,
        new GetRightsMetaQueryBuilder()
            .withResource(resource)
            .build(),
    );
    CreateInstanceRights(
        instanceApiClient,
        new CreateInstanceRightsQueryBuilder()
            .withParty(from.orgUuid)
            .withResource(resource)
            .withInstance(`urn:altinn:dialog-id:${dialogId}`)
            .build(),
        getInstanceDelegationBody(rightsMeta, to),
    );

    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(to.ssn));

    const variables = new DialogSearchVariablesBuilder()
        .withParties([from.orgNo])
        .build();

    GetAllDialogsForPartyCheckForDialogId(graphqlClient, variables, dialogId);

    const getDialogByIdVariables = new DialogByIdVariablesBuilder()
        .withId(dialogId)
        .build();

    GetAndVerifyDialogById(graphqlClient, getDialogByIdVariables);

}
