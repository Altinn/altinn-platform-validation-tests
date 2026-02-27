import { PdpAuthorizeDagl } from "../../../building-blocks/authentication/pdp-authorize/index.js";
import { getItemFromList, getOptions, segmentData, parseCsvData, getNumberOfVUs } from "../../../../helpers.js";
import { getClients, getTokenOpts, getActionLabelAndExpectedResponse } from "./common-functions.js";
import exec from "k6/execution";

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/pdp-single-rights/K6/testdata/authentication/single-rights-${__ENV.ENVIRONMENT}.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  const baseUrl = __ENV.ENVIRONMENT === "tt02"  ? "https://platform.tt02.altinn.no" : `https://platform.${__ENV.ENVIRONMENT}.altinn.cloud`;
  const apResp= http.get(`${baseUrl}/accessmanagement/api/v1/meta/info/accesspackages/search?typeName=organization`);
  const resp = JSON.parse(apResp.body);
  const resources = [];
  for (const item of resp) {
      const accessPackage = item.object.urn.split(":").pop();
      const isAssignable = item.object.isAssignable;
      const isDelegable = item.object.isDelegable;
      if (isAssignable && isDelegable && !accessPackage.includes("konkursbo")) {
          const resource = `testressurs-tilgangspakke-org-${accessPackage}-1`;
          resources.push(resource);
      }
  }
  return [segmentedData, resources];
}

/**
 * Main function executed by each VU.
 */
export default function (testData) {
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    const party = getItemFromList(testData[exec.vu.idInTest - 1], __ENV.RANDOMIZE);
    //tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse(pdpAuthorizeLabelDenyPermit, pdpAuthorizeLabel);
    PdpAuthorizeDagl(
        pdpAuthorizeClient,
        party.ssn,
        party.orgno,
        resource,
        action,
        expectedResponse,
        __ENV.AUTHORIZATION_SUBSCRIPTION_KEY,
        label
    );
}
