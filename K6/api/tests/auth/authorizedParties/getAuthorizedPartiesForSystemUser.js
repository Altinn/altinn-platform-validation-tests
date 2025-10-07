import { SharedArray } from "k6/data";
import { getItemFromList, readCsv } from "../../../../helpers.js";
import { GetAuthorizedParties, getClients } from '../../../building_blocks/auth/authorizedParties/index.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

// Label for the test, to make visible in results,
// make a json file with thresholds containg the label
// and run the test with --config <file>
const label = "getAuthorizedPartiesForSystemUser";

const systemUsersFilename = import.meta.resolve(`../../../../testdata/auth/systemusers-${__ENV.ENVIRONMENT}.csv`);
const systemUsers = new SharedArray('systemUsers', function () {
    return readCsv(systemUsersFilename);
});

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
