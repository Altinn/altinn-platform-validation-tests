import { SharedArray } from 'k6/data';
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { AuthorizedPartiesClient } from '../../../../clients/auth/authorizedParties.js';
import { getClients } from './getClients.js';
import { getItemFromList, readCsv } from '../../../../helpers.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsIn-${__ENV.ENVIRONMENT}-WithPartyUuid.csv`);
const parties = new SharedArray('parties', function () {
    return readCsv(partiesFilename);
});

const label = "getAuthorizedPartiesForUser";

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
  thresholds: {
    [`http_req_duration{name:${label}}`]: [],
    [`http_reqs{name:${label}}`]: []
  }
};

export default function () {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(parties, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.ssn,
        includeAltinn2,
        label
    );
}