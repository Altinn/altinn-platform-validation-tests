import http from "k6/http";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenGenerator, EnterpriseTokenGeneratorOptions } from "../../../../common-imports.js";
import { getItemFromList, getOptions, parseCsvData, requireEnv } from "../../../../helpers.js";
import { GetDialogsQueriesNotificationCondition } from "../../../building-blocks/dialogporten/serviceowner/index.js";

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT"]);
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/dialogs-with-transmissions-${__ENV.ENVIRONMENT}.csv`,
        { tags: { action: "fetch-test-data" } });
    return parseCsvData(res.body);
}

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const orgNos = ["713431400"];

const label = { step: "should-send-notifications" };

export const options = getOptions([label]);

/**
 * @type {ServiceOwnerApiClient | undefined}
 */
let serviceOwnerApiClient = undefined;

/**
 * Creates and caches the client used to interact with the Service Owner Dialog API.
 *
 * The client uses an enterprise token with the
 * `altinn:system/notifications.condition.check` scope and is configured for
 * the `test` organization. The organization number is selected dynamically
 * from the provided list.
 *
 * The same {@link ServiceOwnerApiClient} instance is reused across iterations.
 *
 * @returns {[ServiceOwnerApiClient]} Tuple containing the Service Owner API client.
 */
export function getClients() {
    if (serviceOwnerApiClient === undefined) {
        const tokenOpts = new EnterpriseTokenGeneratorOptions();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:system/notifications.condition.check");
        tokenOpts.set("org", "test");
        tokenOpts.set("orgNo", getItemFromList(orgNos));

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);

        serviceOwnerApiClient = new ServiceOwnerApiClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
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
