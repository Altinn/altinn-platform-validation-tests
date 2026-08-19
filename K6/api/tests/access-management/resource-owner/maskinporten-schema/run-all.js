import runGetMaskinportenSchemaDelegations, { setup } from "./get-maskinporten-schema-delegations.js";

export { setup };

/**
 * Runs the folder's only test, so every folder has the same entry point. A second
 * test in here goes in the list below.
 *
 * @param {object} data Whatever setup returned.
 */
export default function (data) {
    runGetMaskinportenSchemaDelegations(data);
}
