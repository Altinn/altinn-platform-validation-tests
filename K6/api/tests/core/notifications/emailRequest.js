import { check, fail } from "k6"
import { EnterpriseTokenGenerator } from '../../../../commonImports.js';
import { OrdersApiClient } from "../../../../clients/core/notifications/index.js"
import { PostEmailNotificationOrder } from '../../../building_blocks/core/notifications/orders/index.js';
import { uuidv4 } from "../../../../commonImports.js";

export default function () {
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);
    options.set("scopes", "altinn:serviceowner/notifications.create");
    options.set("org", "ttd");
    options.set("orgNo", "991825827");

    const tokenGenerator
        = new EnterpriseTokenGenerator(options, __ENV.tokenGeneratorUserName, __ENV.tokenGeneratorUserPwd)

    const ordersApiClient
        = new OrdersApiClient(__ENV.BASE_URL, tokenGenerator)

    const testData = {
        "subject": "Automated email from Altinn",
        "body": "Dear $recipientName$! This is an automated email generated during the testing of Altinn Notifications. Your registration number is $recipientNumber$. Best regards, Altinn Team",
        "contentType": "Html",
        "fromAddress": "noreply@altinn.cloud",
        "sendersReference": uuidv4(),
        "recipients": [],
    }

    let response = PostEmailNotificationOrder(
        ordersApiClient,
        testData.subject,
        testData.body,
        testData.contentType,
        testData.fromAddress
    )

    check(response, {
        "POST email notification order request. Recipient lookup was successful": (r) => JSON.parse(r.body).recipientLookup.status == 'Success'
    });
}
