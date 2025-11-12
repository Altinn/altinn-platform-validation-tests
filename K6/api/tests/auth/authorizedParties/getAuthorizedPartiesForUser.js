
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { getClients } from './commonFunctions.js';
import { getItemFromList, getOptions } from '../../../../helpers.js';
export { setup } from "./commonFunctions.js"

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const label = "getAuthorizedPartiesForUser";

export const options = getOptions([label]);

export default function (data) {
  const [authorizedPartiesClient] = getClients();
  const userParty = getItemFromList(data, randomize);
  GetAuthorizedParties(
    authorizedPartiesClient,
    "urn:altinn:person:identifier-no",
    userParty.ssn,
    includeAltinn2,
    label
  );
}