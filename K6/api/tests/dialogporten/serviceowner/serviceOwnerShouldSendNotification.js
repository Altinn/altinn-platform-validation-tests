import { SharedArray } from 'k6/data';
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';
import { GetDialogsQueriesNotificationCondition } from '../../../building_blocks/dialogporten/serviceowner/index.js';
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js"

import { getItemFromList, readCsv } from '../../../../helpers.js';

const filenameDialogsWithTransmissions = import.meta.resolve(`../../../../testdata/dialogporten/dialogs-with-transmissions-${__ENV.ENVIRONMENT}.csv`);
const dialogsWithTransmissions = new SharedArray('dialogsWithTransmissions', function () {
    return readCsv(filenameDialogsWithTransmissions);
});

const randomize = (__ENV.RANDOMIZE ?? 'true') === 'true';
const orgNos = ["713431400"];

const label = "should-send-notifications";

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    thresholds: {
        [`http_req_duration{name:${label}}`]: [],
        [`http_reqs{name:${label}}`]: []
    }
};

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
        tokenOpts.set("org", 'test')
        tokenOpts.set("orgNo", getItemFromList(orgNos))
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts)
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [serviceOwnerApiClient]
}



export default function () {
    const [serviceOwnerApiClient] = getClients();
    const dialogWithTransmission = getItemFromList(dialogsWithTransmissions, randomize);
    GetDialogsQueriesNotificationCondition(
        serviceOwnerApiClient,
        dialogWithTransmission.dialogId,
        "NotExists",
        "TransmissionOpened",
        dialogWithTransmission.transmissionId,
        label
    );
}
