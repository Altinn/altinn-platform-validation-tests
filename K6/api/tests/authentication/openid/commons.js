import { lazy, requireEnv } from "../../../../helpers.js";
import { OpenidClient } from "../../../authentication-imports.js";

/**
 * k6 setup stage.
 *
 * Nothing to arrange. Both endpoints are anonymous and read-only, so there is no
 * token to mint and no state to create up front. What the setup does do is fail the
 * run early when the environment is not configured, instead of letting every
 * iteration build a client against an undefined base URL.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

/**
 * Creates and caches the client this folder reads with.
 *
 * Built once per VU and reused across its iterations. There is no token generator
 * here, unlike in the other authentication test folders: the discovery document and
 * the key set are what a relying party fetches before it holds any token at all, so
 * asking for a bearer would test something the endpoints do not require and would
 * tie a test of public metadata to the token generator being up.
 *
 * @returns {OpenidClient} The client.
 */
export const getClient = lazy(function () {
    return new OpenidClient(__ENV.BASE_URL);
});
