import { SharedArray } from "k6/data";
import { getItemFromList, readCsv } from "../../../../helpers.js";
import { GetAuthorizedParties } from '../../../building_blocks/auth/authorizedParties/index.js';
import { AuthorizedPartiesClient } from "../../../../clients/auth/index.js"
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';

const includeAltinn2 = (__ENV.INCLUDE_ALTINN2 ?? 'true') === 'true';
const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';

const systemUsersFilename = import.meta.resolve(`../../../../testdata/auth/systemusers-${__ENV.ENVIRONMENT}.csv`);
const systemUsers = new SharedArray('systemUsers', function () {
    return readCsv(systemUsersFilename);
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

    const systemUser = getItemFromList(systemUsers, randomize);

    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:systemuser:uuid",
        systemUser.systemuserUuid,
        includeAltinn2
    );
}
