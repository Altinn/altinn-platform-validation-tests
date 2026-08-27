import { ResourceClient } from "../../../clients/resource-registry/index.js";

/**
 * @type {ResourceClient | undefined}
 */
let publicResourceClient = undefined;

/**
 * The client the read tests share.
 *
 * Every read operation on resources is anonymous, so this one is built without a
 * token generator. That is deliberate and not a shortcut: a test that reads
 * without a token also shows that the endpoint is open, and it is what lets the
 * read tests run as healthchecks all the way to prod.
 *
 * Cached at module scope, so a VU builds it once.
 *
 * @returns {ResourceClient} The client.
 */
export function getPublicResourceClient() {
    if (publicResourceClient === undefined) {
        publicResourceClient = new ResourceClient(__ENV.BASE_URL);
    }

    return publicResourceClient;
}
