import http from 'k6/http';
import { getItemFromList, getOptions, parseCsvData } from '../../../../helpers.js';
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { getClients } from './commonFunctions.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const label = "getAuthorizedPartiesForSystemUser";

export const options = getOptions([label]);

export function setup() {
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/auth/systemusers-${__ENV.ENVIRONMENT}.csv`);
  return parseCsvData(res.body);
}

export default function (data) {
  const [authorizedPartiesClient] = getClients();
  const systemUser = getItemFromList(data, randomize);
  GetAuthorizedParties(
    authorizedPartiesClient,
    "urn:altinn:systemuser:uuid",
    systemUser.systemuserUuid,
    includeAltinn2,
    label
  );
}
