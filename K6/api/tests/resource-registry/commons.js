import { ResourceClient } from "../../../clients/resource-registry/index.js";
import { lazy } from "../../../helpers.js";

/**
 * The client the read tests share.
 *
 * Every read operation on resources is anonymous, so this one is built without a
 * token generator. That is deliberate and not a shortcut: a test that reads
 * without a token also shows that the endpoint is open, and it is what lets the
 * read tests run as healthchecks all the way to prod.
 *
 * Built once per VU, on the first iteration that asks for it.
 *
 * @returns {ResourceClient} The client.
 */
export const getPublicResourceClient = lazy(function () {
    return new ResourceClient(__ENV.BASE_URL);
});
