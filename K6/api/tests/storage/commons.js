import {
    ApplicationsClient,
    InstancesClient,
    TextsClient,
} from "../../../clients/storage/index.js";
import { lazy } from "../../../helpers.js";
import { AltinnScopes } from "../../../scopes.js";
import {
    getServiceOwnerTokenGenerator,
    getSmokeConfiguration,
} from "../common/smoke.js";

/**
 * The service owner the Storage smoke tests read as, per environment. ttd owns
 * the apps the other tests in this repo create, so it has applications and
 * instances everywhere.
 *
 * @type {{[environment: string]: {[key: string]: string}}}
 */
const TEST_CONFIGURATION = {
    at23: {
        org: "ttd",
        language: "nb",
    },
    tt02: {
        org: "ttd",
        language: "nb",
    },
};

/**
 * Resolves the Storage smoke test configuration for the active environment.
 *
 * `STORAGE_ORG` and `STORAGE_LANGUAGE` override the defaults. `STORAGE_APP`
 * pins the app the per-app calls go to; when it is unset the test takes the
 * first app the org list returns.
 *
 * @returns {{org: string, language: string, app: string|null}} The configuration.
 */
export function getStorageSmokeConfiguration() {
    const configuration = getSmokeConfiguration("Storage", TEST_CONFIGURATION, {
        org: "STORAGE_ORG",
        language: "STORAGE_LANGUAGE",
    });

    return {
        org: configuration.org,
        language: configuration.language,
        app: __ENV.STORAGE_APP || null,
    };
}

const getTokenGenerator = lazy(function () {
    const { org } = getStorageSmokeConfiguration();

    return getServiceOwnerTokenGenerator(org, [
        AltinnScopes.SERVICEOWNER.INSTANCES.READ,
        AltinnScopes.INSTANCES.READ,
    ]);
});

/**
 * @returns {ApplicationsClient} Applications client, built once per VU.
 */
export const getApplicationsClient = lazy(function () {
    return new ApplicationsClient(__ENV.BASE_URL, getTokenGenerator());
});

/**
 * @returns {TextsClient} Texts client, built once per VU.
 */
export const getTextsClient = lazy(function () {
    return new TextsClient(__ENV.BASE_URL, getTokenGenerator());
});

/**
 * @returns {InstancesClient} Instances client, built once per VU.
 */
export const getInstancesClient = lazy(function () {
    return new InstancesClient(__ENV.BASE_URL, getTokenGenerator());
});
