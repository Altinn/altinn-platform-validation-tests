import { check } from "k6";

import { OrdersApiClient } from "../../../../clients/core/notifications/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { PostEmailNotificationOrder } from "../../../building-blocks/core/notifications/orders/index.js";

export function setup() {
    requireEnv(
        [
            "BASE_URL",
            "ENVIRONMENT",
            "ninRecipient",
            "tokenGeneratorUserName",
            "tokenGeneratorUserPwd"
        ]);
    return;
}

export default function () {
    const scopes = CreateScopeString([
        AltinnScopes.SERVICEOWNER.NOTIFICATIONS.CREATE
    ]);
    const options = new EnterpriseTokenBuilder()
        .withScopes(scopes)
        .withOrganization("ttd")
        .withOrganizationNumber("991825827")
        .build();

    const tokenGenerator
        = new EnterpriseTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd);

    const ordersApiClient
        = new OrdersApiClient(__ENV.BASE_URL, tokenGenerator);

    const testData = {
        "sendersReference": uuidv4(),
        "recipients": [{ "nationalIdentityNumber": __ENV.ninRecipient }, { "emailAddress": "noreply@altinn.no" }],
        "emailTemplate": {
            "subject": "Automated email from Altinn",
            "body": "Dear $recipientName$! This is an automated email generated during the testing of Altinn Notifications. Your registration number is $recipientNumber$. Best regards, Altinn Team",
            "contentType": "Html",
            "fromAddress": "noreply@altinn.cloud",
        },
    };

    let response = PostEmailNotificationOrder(
        ordersApiClient,
        testData.emailTemplate,
        testData.sendersReference,
        testData.recipients
    );

    check(response, {
        "POST email notification order request. Recipient lookup was successful": (r) => JSON.parse(r).recipientLookup.status == "Success"
    });
}
