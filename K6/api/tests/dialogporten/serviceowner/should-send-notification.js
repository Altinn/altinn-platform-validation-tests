
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { fetchTestData, getItemFromList, getOptions, requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { GetDialogsQueriesNotificationCondition } from "../../../building-blocks/dialogporten/serviceowner/index.js";

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT"]);
    return fetchTestData(`dialogporten/dialogs-with-transmissions-${__ENV.ENVIRONMENT}.csv`);
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
        const scopes = CreateScopeString([
            AltinnScopes.SYSTEM.NOTIFICATIONS.CONDITION.CHECK
        ]);
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .withOrganization("test")
            .withOrganizationNumber(getItemFromList(orgNos))
            .build();

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
