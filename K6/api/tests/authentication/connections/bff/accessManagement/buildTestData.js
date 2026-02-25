import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { getItemFromList, getOptions } from "../../../../../../helpers.js";
import { getClients, getTokenOpts } from "../../common-functions.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../../helpers.js";
import { PostDelegations, DeleteDelegations, GetPermission } from "../../../../../building-blocks/authentication/access-package/delegate.js";
import { BffConnectionsApiClient, AccessPackageApiClient, ClientDelegationsApiClient } from "../../../../../../clients/authentication/index.js";
import { PostRightholder } from "../../../../../building-blocks/authentication/bff-connections/index.js";

// Labels for different actions
const postRightholderLabel = "1d. Connecting organizations with PostRightholder";
const postDelegationLabel = "1g. Delegate access package from org to org";



const tokenGeneratorLabel = "Personal Token Generator";


const fullmaktGroup = "1. Delegate accesspackage from organization to organization";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;  

// get k6 options
export const options = getOptions(
    [
        postRightholderLabel,
        postDelegationLabel,
        tokenGeneratorLabel,
    ], 
    []
  );

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
  const numberOfVUs = getNumberOfVUs();
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/performance-fullmakt/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
  const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
  const baseUrl = __ENV.ENVIRONMENT === "tt02"  ? "https://platform.tt02.altinn.no" : `https://platform.${__ENV.ENVIRONMENT}.altinn.cloud`;
  const apResp= http.get(`${baseUrl}/accessmanagement/api/v1/meta/info/accesspackages/search?typeName=organization`);
  const resp = JSON.parse(apResp.body);
  const accessPackages = [];
  for (const item of resp) {
      const accessPackage = item.object.urn.split(":").pop();
      const id = item.object.id;
      const isAssignable = item.object.isAssignable;
      const isDelegable = item.object.isDelegable;
      if (isAssignable && isDelegable && !accessPackage.includes("konkursbo")) {
          accessPackages.push({ id, accessPackage });
      }
  }
  return [segmentedData, accessPackages];
}


/**
 * Main function executed by each VU.
 */


// INFO[0000] VU 1 - Testing: 09856399971/c938b018-85e1-4798-b802-6940c7c718d8/314244168 -> 01885298016/8f6a05c3-daef-4f65-9892-8d65bc775959/314251369 and access package: sikkerhet-og-internkontroll - cfe074fa-0a66-4a4b-974a-5d1db8eb94e6  source=console
// - - 349ms 2,66MB
// INFO[0000] VU 1 - Testing: 16838697953/918a431b-35c8-43a9-beb7-36901b5e9d61/314245156 -> 09836599842/47afe962-9e4b-4ac0-94f3-a3df3b6e0b82/313696820 and access package: regnskap-okonomi-rapport - b4e69b54-895e-42c5-bf0d-861a571cd282  source=console
// - - 355ms, 2.58MB
// INFO[0000] VU 1 - Testing: 19906699055/8bfcbb7a-6e1e-46fc-9cc0-0115e0646468/310380776 -> 22042431064/b7da5cbc-1ca3-469e-8823-612e01b50604/701509528 and access package: jordbruk - c5bbbc3f-605a-4dcb-a587-32124d7bb76d  source=console
// 65ms, 20KB 257ms, 2.58MB
// INFO[0000] VU 1 - Testing: 06815398406/1530914e-c889-4bab-9b9f-0a08c0a8d4f7/314259394 -> 07917897136/ccafbf41-f217-4018-b07e-0a038ac39582/314241045 and access package: mobler-og-annen-industri - 07bfd8a5-5b13-4937-84b9-2bd6ac726ea1  source=console
// 203ms, 233KB 273 3,94MB
// INFO[0000] VU 1 - Testing: 16887096590/24eff3b4-cb66-4762-ad6d-e2ab335ee4d0/310597414 -> 28876298726/cb6a1003-a1d2-4133-8975-3ba1c8bc2da6/314241460 and access package: reindrift - 0bb5963e-df17-4f35-b913-3ce10a34b866  source=console
// 272ms, 1.51MB 650ms 4,04MB
// INFO[0000] VU 1 - Testing: 26070313099/edae818e-5af2-4824-b29f-7530f6cce3a5/613874054 -> 14826097761/495198a1-adc7-4f46-a23a-1a1e531e87c3/314241819 and access package: skoleeier - 32bfd131-1570-4b0c-888b-733cbb72d0cb  source=console
// 187ms 234KB 378ms 2,77MB
// INFO[0000] VU 1 - Testing: 17858699983/66d966f1-0b20-42e6-9222-0f19f6b6b014/314256379 -> 26816998068/bc492d5e-2646-4186-bd44-8e86d7443fa2/312241862 and access package: opplaeringskontorleder - 40397a93-b047-4011-a6b8-6b8af16b6324  source=console
// 63ms 23KB 358ms 2.58MB
// INFO[0000] VU 1 - Testing: 03816998785/96ac8014-dafd-4ec8-8c8f-02421cf6dacc/314308875 -> 06826599330/3fc82033-a7d9-4f47-8364-818836d1800c/311018000 and access package: overnatting - 77cdd23a-dddf-43e6-b5c2-0d8299b0888c  source=console
// 80 ms 48KB 440ms 2,59MB
// INFO[0000] VU 1 - Testing: 15010909942/7e2fb167-92cc-4415-bfe4-ef48a4ad0db4/701609603 -> 03050343633/ef9f79a5-161f-4fa6-a9dc-d9c4ac2d5bd2/625244722 and access package: motorvognavgift - 4f4d4567-2384-49fa-b34b-84b4b77139d8  source=console
// 296ms 1,57MB 818ms 4,09MB
// INFO[0000] VU 1 - Testing: 23120511777/61821d76-2288-4657-bde0-cca833abeaf7/624620828 -> 04838397528/23ba5dab-4206-4428-abb7-a8d68b91bd84/313468240 and access package: tekstiler-klaer-laervarer - c6231d60-5373-4179-b98b-1e7eb83da474  source=console
// 84ms 240KB 537ms 2,76MB
// 708202592,58784705,11111574113,1911278,54500815,859a5136-ddc8-4f07-9dec-a6312e2907cf,,bdfc5a1c-98a7-4748-b987-88f9821f8f80,LastName4410710
// 7.5s 27MB 4.58s 29.4MB
export default function (testData) {
    // testdata. [0] contains segmented user data for each VU, [1] contains access packages
    const segmentedData = testData[0];
    const accessPackages = testData[1];
    const to = {
        ssn: "11111574113",
        orgUuid: "859a5136-ddc8-4f07-9dec-a6312e2907cf",
        orgNo: "708202592",
      }

    //212489182,61708170,31850148921,4570356,61767043,588058e8-f997-417d-9a9a-9c40ce928994,regnskapsforer,98e20bbd-5282-45f6-85f5-3ce9f73f0ee7,KOKKEKNIV

    // connectionsApiClient for bff
    const bff = true;
    const [connectionsApiClient, tokenGenerator] = getClients(bff);

    // clients for access package and bff connections
    const bffConnectionsApiClient = new BffConnectionsApiClient(__ENV.BASE_URL, tokenGenerator);
    const accessPackageApiClient = new AccessPackageApiClient(__ENV.BASE_URL, tokenGenerator, bff);

    // Get from org, to org and userto be agent for current VU iteration. Ensure that from and to are not the same, and that user is different from from and to.
    const { from, to1, user } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);
    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.orgUuid}/${from.orgNo} -> ${to.ssn}/${to.orgUuid}/${to.orgNo} and access package: ${accessPackage.accessPackage} - ${accessPackage.id}`);
    //console.log(`VU ${exec.vu.idInTest} - Agent for testing client delegation: ${user.ssn}/${user.partyUuid}/${user.orgNo}`);

    // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(fullmaktGroup, function () {
        PostRightholder(bffConnectionsApiClient, from.orgUuid, to.orgUuid, null, postRightholderLabel);
        PostDelegations(accessPackageApiClient, { party: from.orgUuid, to: to.orgUuid, from: from.orgUuid, packageId: accessPackage.id }, postDelegationLabel); 
    });

    

     

}

function getFromTo(list) {
    let from = undefined;
    if (randomize) {
        from = getItemFromList(list, randomize);
    } else {
        from = list[__ITER % list.length];
    }
    let to = getItemFromList(list, true);
    while (to.ssn === from.ssn) {
        to = getItemFromList(list, true);
    }
    let user = getItemFromList(list, true);
    while (user.ssn === from.ssn || user.ssn === to.ssn) {
        user = getItemFromList(list, true);
    }
    return { from, to, user };
    
}

