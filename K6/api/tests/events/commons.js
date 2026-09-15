import { AppClient } from "../../../clients/events/app/index.js";
import { SubscriptionClient } from "../../../clients/events/subscription/index.js";
import { lazy } from "../../../helpers.js";
import { AltinnScopes } from "../../../scopes.js";
import {
    getServiceOwnerTokenGenerator,
    getSmokeConfiguration,
} from "../common/smoke.js";

/**
 * The service owner and app the Events smoke tests read as, per environment.
 * The app only has to exist; an app without events answers an empty list.
 *
 * @type {{[environment: string]: {[key: string]: string}}}
 */
const TEST_CONFIGURATION = {
    at23: {
        org: "ttd",
        app: "secret",
    },
    tt02: {
        org: "ttd",
        app: "secret",
    },
};

/**
 * Resolves the Events smoke test configuration for the active environment.
 * `EVENTS_ORG` and `EVENTS_APP` override the defaults.
 *
 * @returns {{org: string, app: string}} The configuration.
 */
export function getEventsSmokeConfiguration() {
    const configuration = getSmokeConfiguration("Events", TEST_CONFIGURATION, {
        org: "EVENTS_ORG",
        app: "EVENTS_APP",
    });

    return { org: configuration.org, app: configuration.app };
}

const getTokenGenerator = lazy(function () {
    const { org } = getEventsSmokeConfiguration();

    return getServiceOwnerTokenGenerator(org, [
        AltinnScopes.SERVICEOWNER.EVENTS,
        AltinnScopes.EVENTS.SUBSCRIBE,
    ]);
});

/**
 * @returns {SubscriptionClient} Subscription client, built once per VU.
 */
export const getSubscriptionClient = lazy(function () {
    return new SubscriptionClient(__ENV.BASE_URL, getTokenGenerator());
});

/**
 * @returns {AppClient} App events client, built once per VU.
 */
export const getAppClient = lazy(function () {
    return new AppClient(__ENV.BASE_URL, getTokenGenerator());
});
