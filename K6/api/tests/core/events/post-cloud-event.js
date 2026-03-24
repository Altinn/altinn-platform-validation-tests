import { EventsApiClient } from "../../../../clients/core/events/index.js";
import { SubscriptionsApiClient } from "../../../../clients/core/subscriptions/index.js"
import { PostCloudEvent } from "../../../building-blocks/core/events/post-cloud-event.js";
import { PostSubscription } from "../../../building-blocks/core/subscriptions/post-subscription.js";


import { EnterpriseTokenGenerator, uuidv4 } from "../../../../common-imports.js";

const randomId = __ENV.MANIFEST_GENERATION_TIMESTAMP ?? uuidv4()
const eventType = `performancetest.fixed-rate.${randomId}`;
const resourceFilter = "urn:altinn:resource:ttd-altinn-events-automated-tests";
const endpoint = __ENV.BASE_URL + "/events/api/v1/tests/webhookreceiver";

let subscriptionsApiAclient = undefined;
let tokenGenerator = undefined;
let eventsApiClient = undefined;

function getClients() {
    if (tokenGenerator == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:events.publish altinn:serviceowner altinn:events.subscribe");
        tokenOpts.set("orgNo", "991825827");
        tokenOpts.set("org", "ttd");
        tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
    }
    if (subscriptionsApiAclient == undefined) {
        subscriptionsApiAclient = new SubscriptionsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    if (eventsApiClient == undefined) {
        eventsApiClient = new EventsApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [subscriptionsApiAclient, eventsApiClient, tokenGenerator];
}

export function setup() {
    const [subscriptionsApiAclient, eventsApiClient, tokenGenerator] = getClients();

    const subscriptionId = PostSubscription(subscriptionsApiAclient, endpoint, resourceFilter);

    return subscriptionId;
}

export default function (data) {
    const [subscriptionsApiAclient, eventsApiClient, tokenGenerator] = getClients();

    PostCloudEvent(
        eventsApiClient,
        uuidv4(),
        "https://github.com/Altinn/altinn-platform-validation-tests/tree/main/K6",
        "1.0",
        eventType,
        "/autotest/k6",
        resourceFilter,
        new Date().toISOString(),
    )
}
