import { group } from "k6";

import { getOptions } from "../../../../helpers.js";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";

const env = __ENV.ENVIRONMENT ?? "yt01";

// The organization that holds all the generated consents, only added scenarios for YT01, 
const ORG_NO = "730077254";

const getConsentRequestEventsLabel = { action: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

function getEventsClient() {
    return new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", ORG_NO],
            ])
        )
    );
}

const eventsClient = getEventsClient();

export default function () {
    GetConsentRequestEvents(eventsClient, {}, getConsentRequestEventsLabel);
}
