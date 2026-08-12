import { OrderClient } from "../../../../clients/notifications/order/order.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";

/** @type {EnterpriseTokenGenerator|null} */
let tokenGenerator = null;

/** @type {OrderClient|null} */
let ordersApiClient = null;

/**
 * Lazily creates the clients shared by the order-with-reminders tests.
 *
 * @returns {[OrderClient]} The Order API client.
 */
export function getClients() {
    const organizationName = "ttd";
    const orgNumber = "991825827";

    if (tokenGenerator == null || ordersApiClient == null) {
        const scopes = CreateScopeString([
            AltinnScopes.SERVICEOWNER.NOTIFICATIONS.CREATE
        ]);
        const options = new EnterpriseTokenBuilder()
            .withScopes(scopes)
            .withOrganization(organizationName)
            .withOrganizationNumber(orgNumber)
            .build();

        tokenGenerator
            = new EnterpriseTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd);
        ordersApiClient
            = new OrderClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [ordersApiClient];
}
