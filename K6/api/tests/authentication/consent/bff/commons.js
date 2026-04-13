import http from "k6/http";
import { BffAccessManagementApiClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator } from "../../../../../common-imports.js";
import { parseCsvData, segmentData, getNumberOfVUs } from "../../../../../helpers.js";

/*
* The users in this list have been selected based on the number of consent requests they have.
* The user with the most consent requests has 879, and the one with the least has 100.
* Only from yt01, and will be used in the worst case scenarios tests
*/
export const worst_case_users = [
    {
        userId: "4503247",
        partyUuid: "7274d8d6-231a-42a6-b311-0d3a425268ef",
        label: "a_4503247_879",
    },
    {
        userId: "4547151",
        partyUuid: "1d536653-c312-4b6d-8b78-a260120beab3",
        label: "b_4547151_787",
    },
    {
        userId: "4540067",
        partyUuid: "3f392def-da31-4284-af0d-1bcca530c81c",
        label: "c_4540067_622",
    },
    {
        userId: "4549387",
        partyUuid: "20451a46-0aa8-4d55-b620-f7aef42657c5",
        label: "d_4549387_502",
    },
    {
        userId: "4552870",
        partyUuid: "11212f3e-db43-40cb-9622-ad3ca3e97fe6",
        label: "e_4552870_385",
    },
    {
        userId: "4566849",
        partyUuid: "1f9e7773-3da7-45f4-8754-2ea5e00719e0",
        label: "f_4566849_250",
    },
    {
        userId: "4549665",
        partyUuid: "d757c6ab-9079-4762-b8e5-054094b30354",
        label: "g_4549665_100",
    }
];

let accessManagementApiClient;
let personalTokenGenerator;

/* 
* Since the token generator and the API client are used in every test, we initialize them once and reuse them.
* The token generator will be updated with the correct user and party for each iteration, but the client can be reused since it doesn't hold any state related to the user.
*/
export function getClients() {
    if (accessManagementApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:pdp/authorize.enduser");
        personalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        accessManagementApiClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);
    }
    return [accessManagementApiClient, personalTokenGenerator];
}

/*
* Function to generate token options for a given user and party.
* The options include the environment, time to live (ttl), scopes, userId, and partyuuid.
* These options are used by the token generator to create a token that can be used to authenticate the user when making requests to the API.
*/
export function getTokenOpts(userId, partyuuid) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:portal/enduser");
    tokenOpts.set("userId", userId);
    tokenOpts.set("partyuuid", partyuuid);
    return tokenOpts;
}

/*
* The setup function is called once before the test starts and is used to prepare the data for the test.
* It retrieves the users for the current environment from a CSV file, segments the data based on the number of virtual users (VUs) in the test, and returns the segmented data.
* This allows us to distribute the users across the VUs, ensuring that each VU has a subset of the users to work with during the test.
* The CSV file is expected to have the same format as the worst_case_users array, with columns for userId, partyUuid, and label.
*/
export function setup() {
    const numberOfVUs = getNumberOfVUs();
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid-v2.csv`);
    const segmentedData = segmentData(parseCsvData(res.body), numberOfVUs);
    return segmentedData;
}
