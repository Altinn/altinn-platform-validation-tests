import { SharedArray } from 'k6/data';
import { PdpAuthorizeUser } from '../../../building_blocks/auth/pdpAuthorize/index.js';
import { getItemFromListDividedPerVu, readCsv } from '../../../../helpers.js';
import { randomIntBetween } from '../../../../commonImports.js';
import { getClients } from './getClients.js';

const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';
const breakpoint = (__ENV.BREAKPOINT ?? 'false') === 'true';
const abort_on_fail = (__ENV.ABORT_ON_FAIL ?? 'false') === 'true';
const stages_duration = __ENV.BREAKPOINT_STAGE_DURATION ?? '1m';
const stages_target = __ENV.BREAKPOINT_STAGES_TARGET ?? 5;

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsDagl-${__ENV.ENVIRONMENT}.csv`);
const parties = new SharedArray('parties', function () {
    return readCsv(partiesFilename);
});

// Labels for different actions
const pdpAuthorizeLabel = "PDP Authorize";
const pdpAuthorizeLabelDenyPermit = "PDP Authorize Deny";
const tokenGeneratorLabel = "Personal Token Generator";

/**
 * Function to get k6 options based on labels and breakpoint settings. 
 * Candidate to move out of this file if used elsewhere.
 * @param {} labels 
 * @returns 
 */
function getOptions(labels) {
  const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    // Placeholder, will be populated below
    thresholds: {}
  };

  if (breakpoint) {
    // Thresholds for breakpoint mode. Set abortOnFail based on env var, and labels to collect stats.
    for (const label of labels) {
      options.thresholds[`http_req_duration{name:${label}}`] = [{ threshold: "max<5000", abortOnFail: abort_on_fail }];
      options.thresholds[`http_req_failed{name:${label}}`] = [{ threshold: 'rate<=0.0', abortOnFail: abort_on_fail }];
      options.thresholds[`http_reqs{name:${label}}`] = [];
    }
    
    // Breakpoint stages
    options.stages = [
      { duration: stages_duration, target: stages_target },
    ];
  } else {
    // No thresholds for normal mode. Set labels with empty arrays to collect stats.
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

/**
 * Main function executed by each VU.
 */
export default function () {
    const party = getItemFromListDividedPerVu(parties, randomize);
    const [pdpAuthorizeClient, tokenGenerator] = getClients();
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(party.ssn));
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

/**
 * Function to get token options map.
 * Candidate to move out of this file if used elsewhere.
 * @param {string} ssn - social security number
 * @returns map of token options
 */
function getTokenOpts(ssn) {
  const tokenOpts = new Map();
  tokenOpts.set("env", __ENV.ENVIRONMENT);
  tokenOpts.set("ttl", 3600);
  tokenOpts.set("scopes", "altinn:authorization/authorize.admin");
  tokenOpts.set("pid", ssn);
  return tokenOpts;
}

/**
 * Function to randomly select action, label, and expected response.
 * 90% read and write with Permit, 10% sign with NotApplicable.
 * Candidate to move out of this file if used elsewhere.
 * @return {Array} [action, label, expectedResponse]
 */
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