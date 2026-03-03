import exec from "k6/execution";
import http from "k6/http";
import { group } from "k6";

import { GetConnections, PostRightholder } from "../../../../building-blocks/authentication/connections/index.js";
import { PostDelegations, DeleteDelegations } from "../../../../building-blocks/authentication/access-package/delegate.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { BffConnectionsApiClient, BffAccessPackageApiClient } from "../../../../../clients/authentication/index.js";
import { getItemFromList, parseCsvData, segmentData, getNumberOfVUs, getOptions } from "../../../../../helpers.js";

// Labels for different actions
const postRightholderLabel = "1. Connecting users with PostRightholder";
const getRightholdersToLabel = "2. Get rightholders";
const getRightholdersWithoutToLabel = "3. Get rightholders";
const tokenGeneratorLabel = "Personal Token Generator";
const accessPackageLabel = "4. Access Package Delegation";
const accessPackageDeleteLabel = "5. Access Package Delete Delegation";
const groupLabel = "0. Delegate accesspackage from user to user";

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

const accessPackages = [
    { id: "449d3027-9ef4-4363-a5a1-99edef3e67ab", accessPackage: "innbygger-frivillighet" },
    { accessPackage: "innbygger-forsikring", id: "4de3029b-bbab-4c76-96bd-3eb377a2b63f" },
    { accessPackage: "innbygger-patent", id: "ca5faa7e-dbc3-4071-935d-a95bc8fc14e1" },
    { accessPackage: "innbygger-sykefravaer", id: "e54b8f6f-edd3-48a1-8e31-c8ed57087ce8" },
    { accessPackage: "innbygger-attester", id: "f4bb3f8d-1ecb-4832-a5db-b954a6fd6f70" },
    { accessPackage: "innbygger-helsetjenester", id: "fadbe391-bedb-4487-9514-9d424d7c54e9" },
    { accessPackage: "innbygger-bolig-eiendom", id: "03c04070-abac-488f-a63b-84d69f2b9b5b" },
    { id: "25d9cb75-9f72-4cc6-b57f-0b759f69e3ed", accessPackage: "innbygger-byggesoknad" },
    { accessPackage: "innbygger-pensjon", id: "2a54082f-c15d-4768-9dc6-f284091b8660" },
    { id: "2c721152-d0ef-488b-ab93-a358ce615ae0", accessPackage: "innbygger-sertifisering" },
    { accessPackage: "innbygger-vapen", id: "2e9a3f64-5395-4170-a8d7-8fcc8ff2ac36" },
    { accessPackage: "innbygger-arbeidsliv", id: "3ba61d9a-82c3-4542-bd64-0e5e81d983fb" },
    { accessPackage: "innbygger-stotte-tilskudd", id: "3df18544-67ec-4725-a199-94aa998c5920" },
    { id: "420378eb-01ca-4e00-96cd-7b3d5558bdfc", accessPackage: "innbygger-straffesak" },
    { accessPackage: "innbygger-bank-finans", id: "54418547-7991-449d-b819-2c4698cb006f" },
    { id: "5a051eb7-34a1-4bd7-bd99-b856231aa586", accessPackage: "innbygger-utdanning" },
    { accessPackage: "innbygger-soknader-sertifisering", id: "5d572527-02e1-4e02-b423-c6617a49492f" },
    { accessPackage: "innbygger-kjoretoy", id: "67542d17-e2a9-488b-b13b-c83bd8711acd" },
    { accessPackage: "innbygger-forerkort", id: "6b35160e-a23d-4377-bd19-8535fc57580f" },
    { accessPackage: "innbygger-skatteforhold-privatpersoner", id: "6b4c19ff-250a-4625-a4f7-d9684db537f4" },
    { accessPackage: "innbygger-samliv", id: "7778f33d-83b7-4089-93fc-4fbacbf28600" },
    { accessPackage: "innbygger-barn-foreldre", id: "7b333ea2-8fc2-47a6-93c4-dad50d3ef9a6" },
    { accessPackage: "innbygger-permisjon-oppsigelse", id: "7e35f1d3-7477-4cd1-b179-d00613fe36af" },
    { accessPackage: "innbygger-barnehage-sfo-skole", id: "8dd91aeb-9f95-4d1c-bcf0-f46bd86a4ef7" },
    { accessPackage: "innbygger-fritidsaktiviteter-friluftsliv", id: "945e8c72-6f49-4dac-b068-d378b5a6a1a3" },
    { accessPackage: "innbygger-avlastning-stotte", id: "990bc1ff-b0cd-4d87-83ae-861c22c980fd" },
    { id: "9b2c3171-d95d-42cf-8235-4f9309b311e9", accessPackage: "innbygger-design-varemerke" },
    { accessPackage: "innbygger-kultur", id: "9e65c773-1ac4-46db-8cfc-57c528b66dfb" },
    { accessPackage: "innbygger-pleie-omsorg", id: "9e785c27-9769-4e46-bb8c-d106dd8cc5a2" },
    { accessPackage: "innbygger-toll-avgift", id: "9f077a78-6530-428f-9660-7f61a8262f65" },
    { accessPackage: "innbygger-idrett", id: "b01f84f6-598a-42d6-b675-acf6a612c55d" },
    { accessPackage: "innbygger-behandling", id: "b35d9354-3247-4182-ade2-4c41d7ba7d4e" },
    { accessPackage: "innbygger-loyve", id: "ba9c67da-3696-4c08-8472-542ad9eead94" },
    { accessPackage: "innbygger-innkreving", id: "ede11283-7246-4e51-9600-5408bcd73e16" },
    { accessPackage: "innbygger-tilgangsstyring-privatperson", id: "540a25ff-6fd9-4574-8573-249c1779d253" }
];

let tokenGenerator = undefined;
let connectionsApiClient = undefined;
let accessPackageApiClient = undefined;

// get k6 options
export const options = getOptions([postRightholderLabel, getRightholdersToLabel, getRightholdersWithoutToLabel, accessPackageLabel, accessPackageDeleteLabel, tokenGeneratorLabel]);


function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
    }
    if (connectionsApiClient == undefined) {
        connectionsApiClient = new BffConnectionsApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    if (accessPackageApiClient == undefined) {
        accessPackageApiClient = new BffAccessPackageApiClient(__ENV.AM_UI_BASE_URL, tokenGenerator);
    }
    return [connectionsApiClient, accessPackageApiClient, tokenGenerator];
}

export function getTokenOpts(userId, partyuuid) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    tokenOpts.set("userId", userId);
    tokenOpts.set("partyuuid", partyuuid);
    return tokenOpts;
}

/**
 * Setup function to segment data for VUs.
 */
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */
export default function (segmentedData) {
    const [connectionsApiClient, accessPackageApiClient, tokenGenerator] = getClients();

    // // Get from and to users for the test iteration
    const { from, to } = getFromTo(segmentedData[exec.vu.idInTest - 1]);
    const accessPackage = getItemFromList(accessPackages, true);
    console.log(`VU ${exec.vu.idInTest} - Testing: ${from.ssn}/${from.partyUuid} -> ${to.ssn}/${to.partyUuid} and access package: ${accessPackage.accessPackage} - ${accessPackage.id}`);

    // // Set token generator options for current iteration
    tokenGenerator.setTokenGeneratorOptions(getTokenOpts(from.userId, from.partyUuid));

    // // perform test actions; connect users, get rightholders with and without to parameter, delegate access package, delete delegation
    group(groupLabel, function () {
        PostRightholder(connectionsApiClient, from.partyUuid, to.ssn, to.lastName, postRightholderLabel);
        getRightHolders(connectionsApiClient, from);
        getRightHoldersWithoutTo(connectionsApiClient, from);
        PostDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageLabel);
        DeleteDelegations(accessPackageApiClient, { party: from.partyUuid, to: to.partyUuid, from: from.partyUuid, packageId: accessPackage.id }, accessPackageDeleteLabel);
    });
}

function getRightHolders(connectionsApiClient, party) {
    const queryParamsTo = {
        party: party.partyUuid,
        from: party.partyUuid,
        to: party.partyUuid,
        includeClientDelegations: true,
        includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersToLabel
    );
    return respBody;
}

function getRightHoldersWithoutTo(connectionsApiClient, party) {
    const queryParamsTo = {
        party: party.partyUuid,
        from: party.partyUuid,
        includeClientDelegations: true,
        includeAgentConnections: true,
    };
    const respBody = GetConnections(
        connectionsApiClient,
        queryParamsTo,
        getRightholdersWithoutToLabel
    );
    return respBody;
}

function getFromTo(list) {
    if (randomize) {
        const from = getItemFromList(list, randomize);
        let to = getItemFromList(list, randomize);
        while (to.ssn === from.ssn) {
            to = getItemFromList(list, randomize);
        }
        return { from, to };
    } else {
        const from = list[__ITER % list.length];
        let to = getItemFromList(list, true);
        while (to.ssn === from.ssn) {
            to = getItemFromList(list, true);
        }
        return { from, to };
    }

}

