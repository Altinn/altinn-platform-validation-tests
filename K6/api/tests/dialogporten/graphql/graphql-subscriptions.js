import sse from "k6/x/sse";
import { EnterpriseTokenGenerator, PersonalTokenGenerator, randomItem } from "../../../../common-imports.js";
import { readCsv } from "../../../../helpers.js";
import { getAllDialogsForPartyQuery, getDialogByIdQuery } from "./queries.js";
import { sleep } from "k6";
import { Counter } from "k6/metrics";
import exec from "k6/execution";

import { UpdateDialog } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/serviceowner.js";
import { GraphQLApiClient } from "../../../../clients/dialogporten/graphql/index.js";
import { PostGQ } from "../../../building-blocks/dialogporten/graphql/post-gq.js";


export const eventsReceived = new Counter("events_received");
export const successfulUpdates = new Counter("successful_updates");
export const failedUpdates = new Counter("failed_updates");
export const streamsOpened = new Counter("streams_opened");
export const streamsFailed = new Counter("streams_failed");

const endUser_dialogid = readCsv("../../../../testdata/dialogporten/idk_what.csv");

let serviceOwnerApiClient = undefined;

let clientGraphQLApiClient = undefined;
let clientPersonalTokenGenerator = undefined;

let serverGraphQLApiClient = undefined;
let serverPersonalTokenGenerator = undefined;

export let options = {
    scenarios: {
        /*
        clients: {
            executor: "constant-vus",
            exec: "runClients",
            duration: "60s",
            vus: 2000
        },
        */
        clients: {
            executor: "ramping-vus",
            exec: "runClients",
            startVUs: 0,
            stages: [
                { duration: "30s", target: 100 },
                { duration: "30s", target: 200 },
                { duration: "30s", target: 300 },
                { duration: "30s", target: 400 },
                { duration: "30s", target: 500 },
                { duration: "30s", target: 600 },
                { duration: "30s", target: 700 },
                { duration: "30s", target: 800 },
                { duration: "30s", target: 900 },
                { duration: "30s", target: 1000 },
                { duration: "30s", target: 1100 },
                { duration: "30s", target: 1200 },
                { duration: "30s", target: 1300 },
                { duration: "30s", target: 1400 },
                { duration: "30s", target: 1500 },
                { duration: "30s", target: 1600 },
                { duration: "30s", target: 1700 },
                { duration: "30s", target: 1800 },
                { duration: "30s", target: 1900 },
                { duration: "30s", target: 2000 },
                { duration: "30s", target: 2100 },
                { duration: "30s", target: 2200 },
                { duration: "30s", target: 2300 },
                { duration: "30s", target: 2400 },
                { duration: "30s", target: 2500 },
                { duration: "30s", target: 2600 },
                { duration: "30s", target: 2700 },
                { duration: "30s", target: 2800 },
                { duration: "30s", target: 2900 },
                { duration: "30s", target: 3000 },
                { duration: "30s", target: 3100 },
                { duration: "30s", target: 3200 },
                { duration: "30s", target: 3300 },
                { duration: "30s", target: 3400 },
                { duration: "30s", target: 3500 },
                { duration: "30s", target: 3600 },
                { duration: "30s", target: 3700 },
                { duration: "30s", target: 3800 },
                { duration: "30s", target: 3900 },
                { duration: "30s", target: 4000 },
            ],
        },

        server: {
            executor: "constant-vus",
            exec: "runUpdater",
            duration: "1200s",
            vus: 10,
            startTime: "15s"
        },
    },
};

function getServerClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("orgName", "digdir");
        tokenOpts.set("orgNo", "713431400");
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider digdir:dialogporten.serviceprovider.search");
        const enterpriseTokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, enterpriseTokenGenerator);
    }

    if (serverGraphQLApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("pid", "08844397713");
        tokenOpts.set("scopes", "digdir:dialogporten.noconsent openid altinn:portal/enduser altinn:instances.read");
        serverPersonalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        serverGraphQLApiClient = new GraphQLApiClient(__ENV.BASE_URL, serverPersonalTokenGenerator);
    }

    return [serviceOwnerApiClient, serverGraphQLApiClient, serverPersonalTokenGenerator];
}
function getClientClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("orgName", "digdir");
        tokenOpts.set("orgNo", "713431400");
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider digdir:dialogporten.serviceprovider.search");
        const enterpriseTokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, enterpriseTokenGenerator);
    }

    if (clientGraphQLApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("pid", "08844397713");
        tokenOpts.set("scopes", "digdir:dialogporten.noconsent openid altinn:portal/enduser altinn:instances.read");
        clientPersonalTokenGenerator = new PersonalTokenGenerator(tokenOpts);
        clientGraphQLApiClient = new GraphQLApiClient(__ENV.BASE_URL, clientPersonalTokenGenerator);
    }

    return [serviceOwnerApiClient, clientGraphQLApiClient, clientPersonalTokenGenerator];
}



export function runUpdater() {
    const [serviceOwnerApiClient, graphQLApiClient, serverPersonalTokenGenerator] = getServerClients();
    const item = randomItem(endUser_dialogid);
    const body = getGraphqlRequestBodyForAllDialogsForParty(item.enduser);
    serverPersonalTokenGenerator.setTokenGeneratorOptions(getPersonalTokenOpts(item.enduser));
    const dialogs = JSON.parse(PostGQ(graphQLApiClient, body));
    if (dialogs && dialogs.data && dialogs.data.searchDialogs && dialogs.data.searchDialogs.items && dialogs.data.searchDialogs.items.length > 0) {
        let dialogId, dialogToken, status, title;

        // const dialog = randomItem(dialogs.data.searchDialogs.items);
        const dialog = dialogs.data.searchDialogs.items[0];
        const dialogBody = getGraphqlRequestBodyForDialogById(dialog.id);
        const dialogDetails = JSON.parse(PostGQ(graphQLApiClient, dialogBody));

        dialogId = dialog.id;
        title = dialogDetails.data.dialogById.dialog.content.title;
        status = dialogDetails.data.dialogById.dialog.status;
        dialogToken = dialogDetails.data.dialogById.dialog.dialogToken;

        let mutationBody = {
            "status": mapStatus(status),
            "ExpiresAt": "2125-02-13T23:16:51.9421070Z",
            "content": {
                "title":
                    JSON.parse(JSON.stringify(title))
            }
        };
        const newTitleValue = mutationBody.content.title.value[0].value.split("-").length > 1 ?
            mutationBody.content.title.value[0].value.split("-")[0] :
            mutationBody.content.title.value[0].value += " - " + new Date().toISOString();

        mutationBody.content.title.value[0].value = newTitleValue.trim();
        UpdateDialog(serviceOwnerApiClient, dialogId, mutationBody);

        // Restore the title
        mutationBody = {
            "status": mapStatus(status),
            "ExpiresAt": "2125-02-13T23:16:51.9421070Z",
            "content": {
                "title": JSON.parse(JSON.stringify(title))
            }
        };
        UpdateDialog(serviceOwnerApiClient, dialogId, mutationBody);
    } else {
        console.warn(`No dialogs found for enduser ${item.enduser}`);
    }
}

export function runClients() {
    const [_, graphQLApiClient, personalTokenGenerator] = getClientClients();
    const item = randomItem(endUser_dialogid);


    const body = getGraphqlRequestBodyForAllDialogsForParty(item.enduser);
    personalTokenGenerator.setTokenGeneratorOptions(getPersonalTokenOpts(item.enduser));
    const r = PostGQ(graphQLApiClient, body);
    const dialogs = JSON.parse(r);


    if (dialogs && dialogs.data && dialogs.data.searchDialogs && dialogs.data.searchDialogs.items && dialogs.data.searchDialogs.items.length > 0) {
        let dialogId, dialogToken, status, title;

        //const dialog = randomItem(dialogs.data.searchDialogs.items);
        const dialog = dialogs.data.searchDialogs.items[0];
        dialogId = dialog.id;
        const dialogBody = getGraphqlRequestBodyForDialogById(dialogId);
        const r = PostGQ(graphQLApiClient, dialogBody);
        const dialogDetails = JSON.parse(r);

        title = dialogDetails.data.dialogById.dialog.content.title;
        status = dialogDetails.data.dialogById.dialog.status;
        dialogToken = dialogDetails.data.dialogById.dialog.dialogToken;

        open_sse(dialogId, dialogToken);
    }
}

export function getPersonalTokenOpts(ssn) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("pid", ssn);
    tokenOpts.set("scopes", "digdir:dialogporten.noconsent openid altinn:portal/enduser altinn:instances.read");
    return tokenOpts;
}


function open_sse(dialogId, dialogToken) {
    const url = `${__ENV.BASE_URL}/dialogporten/graphql/stream?dialogId=${dialogId}`;
    const body = JSON.stringify({
        operationName: "sub",
        query: `subscription sub { dialogEvents(dialogId: \"${dialogId}\") { id type } }`,
        variables: {},
    });
    const params = {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "text/event-stream",
            Authorization: `Bearer ${dialogToken}`,
        },
        tags: { "function": "open_sse" }
    };

    const response = sse.open(url, params, function (client) {
        client.on("open", function open() {
            //streamsOpened.add(1, { vu: String(exec.vu.idInInstance) });
            // streamsOpened.add(1, { vu: String(exec.vu.idInInstance) });
            streamsOpened.add(1);
            // console.log("open", exec.vu.idInInstance);
        });

        client.on("event", function (event) {
            if (event.name && event.name === "next") {
                // console.log(`received event id=${event.id}, name=${event.name}, data=${event.data}`);
                eventsReceived.add(1, { vu: String(exec.vu.idInInstance) });
            }
        });

        client.on("error", function (e) {
            // failedUpdates.add(1, { vu: String(exec.vu.idInInstance) });
            failedUpdates.add(1);
            console.log("An unexpected error occurred: ", e.error());
        });
    });
    return response;
}



export function getGraphqlRequestBodyForAllDialogsForParty(endUser) {
    const variables = {
        partyURIs: [`urn:altinn:person:identifier-no:${endUser}`],
        limit: 100,
        label: ["DEFAULT"],
        status: ["NOT_APPLICABLE", "IN_PROGRESS", "AWAITING", "REQUIRES_ATTENTION", "COMPLETED"]
    };
    let request = JSON.parse(JSON.stringify(getAllDialogsForPartyQuery));
    request.variables = { ...request.variables, ...variables };
    return request;
}

export function getGraphqlRequestBodyForDialogById(dialogId) {
    let request = JSON.parse(JSON.stringify(getDialogByIdQuery));
    request.variables.id = dialogId;
    return request;
}

function mapStatus(status) {
    switch (status) {
        case "NOT_APPLICABLE":
            return "notApplicable";
        case "IN_PROGRESS":
            return "inProgress";
        case "AWAITING":
            return "awaiting";
        case "REQUIRES_ATTENTION":
            return "requiresAttention";
        case "COMPLETED":
            return "completed";
    }
}
