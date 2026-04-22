/*
 * Test for PDP Authorize - Organization to Enduser instance delegations
*/
import { PdpAuthorizeOrgInstance } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getItemFromList, getOptions, getNumberOfVUs, segmentData, parseCsvData } from "../../../../helpers.js";
import { randomIntBetween } from "../../../../common-imports.js";
import { getClients } from "./common-functions.js";
import exec from "k6/execution";
import http from "k6/http";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

// Only resource in use for now, but can be extended with more resources if needed
const resource = "app_ttd_signering-brukerstyrt";

// Only task for now, but can be extended with more tasks if needed
const task = "SigningTask_Founders";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/instance-delegations-org-${__ENV.ENVIRONMENT}.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], randomize);
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizelabels);

    // instance id format: urn:altinn:instance-id:{partyId}/{uuid}
    // only instance in yt so far is aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
    const instance = `urn:altinn:instance-id:${party.partyid}/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`;
    PdpAuthorizeOrgInstance(
        pdpAuthorizeClient,
        party.tossn,
        party.fromorgno,
        resource,
        instance,
        task,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        label
    );
}


/**
 * Function to randomly select action, label, and expected response.
 * 90% sign with Permit, 10% read with NotApplicable.
 * @return {Array} [action, label, expectedResponse]
 */
function getActionLabelAndExpectedResponse(denyLabel, permitlabels) {
    const randNumber = randomIntBetween(0, 10);
    switch (randNumber) {
        case 0:
            return ["read", denyLabel, "NotApplicable"];
        default:
            return ["sign", permitLabel, "Permit"];
    }
}
