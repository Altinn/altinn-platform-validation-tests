import { getItemFromList, getOptions } from '../../../../helpers.js';
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { getClients } from './commonFunctions.js';
export { setup } from "./commonFunctions.js"

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const label = "getAuthorizedPartiesForSystemUser";

export const options = getOptions([label]);

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
