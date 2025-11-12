import http from "k6/http";
import { EnterpriseTokenGenerator } from "../../../../commonImports.js";
import { GetDialogsQueriesNotificationCondition } from "../../../building_blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";


export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/dialogs-with-transmissions-${__ENV.ENVIRONMENT}.csv`);
    return parseCsvData(res.body);
}

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const orgNos = ["713431400"];

const label = "should-send-notifications";

export const options = getOptions([label]);

let serviceOwnerApiClient = undefined;

/**
 * Function to set up and return clients to interact with the Service Owner Dialog API
 *
 * @returns {Array} An array containing the AuthorizedPartiesClient instance
 */
export function getClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:system/notifications.condition.check");
        tokenOpts.set("org", "test");
        tokenOpts.set("orgNo", getItemFromList(orgNos));
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [serviceOwnerApiClient];
}



export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const dialogWithTransmission = getItemFromList(data, randomize);
    GetDialogsQueriesNotificationCondition(
        serviceOwnerApiClient,
        dialogWithTransmission.dialogId,
        "NotExists",
        "TransmissionOpened",
        dialogWithTransmission.transmissionId,
        label
    );
}
