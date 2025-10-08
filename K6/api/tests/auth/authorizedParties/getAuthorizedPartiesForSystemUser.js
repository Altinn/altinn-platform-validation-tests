import { SharedArray } from "k6/data";
import { getItemFromList, readCsv } from "../../../../helpers.js";
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { getClients } from './getClients.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const systemUsersFilename = import.meta.resolve(`../../../../testdata/auth/systemusers-${__ENV.ENVIRONMENT}.csv`);
const systemUsers = new SharedArray('systemUsers', function () {
    return readCsv(systemUsersFilename);
});

const label = "getAuthorizedPartiesForSystemUser";

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
  thresholds: {
    [`http_req_duration{name:${label}}`]: [],
    [`http_reqs{name:${label}}`]: []
  }
};

export default function () {
    const [authorizedPartiesClient] = getClients();
    const systemUser = getItemFromList(systemUsers, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:systemuser:uuid",
        systemUser.systemuserUuid,
        includeAltinn2,
        label
    );
}
