import { SharedArray } from 'k6/data';
import { GetAuthorizedParties, getClients } from '../../../building_blocks/auth/authorizedParties/index.js';
import { getItemFromList, readCsv } from '../../../../helpers.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

// Label for the test, to make visible in results,
// make a json file with thresholds containg the label
// and run the test with --config <file>
const label = "getAuthorizedPartiesForUser";

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsIn-${__ENV.ENVIRONMENT}-WithPartyUuid.csv`);
const parties = new SharedArray('parties', function () {
    return readCsv(partiesFilename);
});

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