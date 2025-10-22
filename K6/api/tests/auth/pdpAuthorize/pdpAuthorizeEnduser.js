import { SharedArray } from 'k6/data';
import { PdpAuthorizeUser } from '../../../building_blocks/auth/pdpAuthorize/index.js';
import { getItemFromListForVu, readCsv } from '../../../../helpers.js';
import { randomIntBetween } from '../../../../commonImports.js';
import { PdpAuthorizeClient } from "../../../../clients/auth/index.js"
import { PersonalTokenGenerator } from '../../../../commonImports.js';

const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';
const breakpoint = (__ENV.BREAKPOINT ?? 'false') === 'true';
const abort_on_fail = (__ENV.ABORT_ON_FAIL ?? 'false') === 'true';
const stages_duration = __ENV.BREAKPOINT_STAGE_DURATION ?? '1m';
const stages_target = __ENV.BREAKPOINT_STAGES_TARGET ?? 5;

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsDagl-${__ENV.ENVIRONMENT}.csv`);
const parties = new SharedArray('parties', function () {
    return readCsv(partiesFilename);
});

const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

let pdpAuthorizeClient = undefined;

export function getOptions(labels) {
  const options = {
    setupTimeout: '10m',
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    thresholds: {}
  };

  if (breakpoint) {
    for (const label of labels) {
      options.thresholds[`http_req_duration{name:${label}}`] = [{ threshold: "max<5000", abortOnFail: abort_on_fail }];
      options.thresholds[`http_req_failed{name:${label}}`] = [{ threshold: 'rate<=0.0', abortOnFail: abort_on_fail }];
      options.thresholds[`http_reqs{name:${label}}`] = [];
    }
    
    options.stages = [
      { duration: stages_duration, target: stages_target },
    ];
  } else {
    for (const label of labels) {
      options.thresholds[`http_req_duration{name:${label}}`] = [];
      options.thresholds[`http_req_failed{name:${label}}`] = [];
      options.thresholds[`http_reqs{name:${label}}`] = [];
    }
  }
  return options;
}

export const options = getOptions([pdpAuthorizeLabel, pdpAuthorizeLabelDenyPermit, tokenGeneratorLabel]);

// resource with read/write for PRIV and DAGL
const resource = "ttd-dialogporten-performance-test-02";

// export function setup() {
//   const UserTokensMap = new Map();
//   let tokenCount = 0
//   for (let party of parties) {
//       const tokenGen = getTokenGenerator(party.ssn);
//       const token = tokenGen.getToken();
//       UserTokensMap.set(party.ssn, token);
//       tokenCount++;
//       if (tokenCount % 100 === 0) {
//           console.log(`Generated ${tokenCount} tokens...`);
//       }
//       if (tokenCount >= 10000) {
//           break; // Limit to 1000 tokens for performance
//       }
//   }
//   return UserTokensMap;
// }

const tokens = new Map();
function getToken(ssn) {
    if (tokens.has(ssn)) {
        return tokens.get(ssn);
    } else {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:authorization/authorize.admin");
        tokenOpts.set("pid", ssn);
        const tokenGen = new PersonalTokenGenerator(tokenOpts)
        const token = tokenGen.getToken();
        tokens.set(ssn, token);
        return token;
    }
}
export default function () {
    const party = getItemFromListForVu(parties, randomize);
    if (!pdpAuthorizeClient) {
        pdpAuthorizeClient = new PdpAuthorizeClient(__ENV.BASE_URL);
    }
    //const tokenGenerator = getTokenGenerator(userParty.ssn);
    pdpAuthorizeClient.setToken(getToken(party.ssn));
    const [action, label, expectedResponse] = getActionLabelAndExpectedResponse();
    PdpAuthorizeUser(
        pdpAuthorizeClient,
        party.ssn,
        resource,
        action,
        expectedResponse,
        __ENV.SUBSCRIPTION_KEY,
        label
    );
}


function getTokenGenerator(ssn) {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);
  tokenOpts.set("scopes", "altinn:authorization/authorize.admin");
  tokenOpts.set("pid", ssn);
  const tokenGen = new PersonalTokenGenerator(tokenOpts)
  return tokenGen;
}

function getActionLabelAndExpectedResponse() {  
  const randNumber = randomIntBetween(0, 10);
  switch (randNumber) {
      case 0:
          return ["sign", pdpAuthorizeLabelDenyPermit, 'NotApplicable']; 
      case 1,3,5,7,9:
          return ["read", pdpAuthorizeLabel, 'Permit'];
      default:
          return ["write", pdpAuthorizeLabel, 'Permit'];
  }
}