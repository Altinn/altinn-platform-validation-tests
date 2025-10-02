import { SharedArray } from 'k6/data';
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { AuthorizedPartiesClient } from "../../../../clients/auth/index.js"
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';
import { getItemFromList, readCsv } from '../../../../helpers.js';


const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const partiesFilename = import.meta.resolve(`../../../../testdata/auth/orgsIn-${__ENV.ENVIRONMENT}-WithPartyUuid.csv`);
const parties = new SharedArray('parties', function () {
    return readCsv(partiesFilename);
});

let authorizedPartiesClient = undefined;

function getClients(orgNo) {
    if (authorizedPartiesClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
        tokenOpts.set("orgNo", orgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts)

        authorizedPartiesClient = new AuthorizedPartiesClient(__ENV.BASE_URL, tokenGenerator);

    }
    return [authorizedPartiesClient]
}

export default function () {
    [authorizedPartiesClient] = getClients("713431400");
    const party = getItemFromList(parties, randomize);
    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        party.orgNo,
        includeAltinn2
    );
}