import runChangeRequestSystemUser, { setup as setupChangeRequestSystemUser, teardown as teardownChangeRequestSystemUser } from "./change-request-system-user/run-all.js";
import runResourceRegistry, { setup as setupResourceRegistry } from "./resource-registry/run-all.js";
import runSystemRegister, { setup as setupSystemRegister, teardown as teardownSystemRegister } from "./system-register/run-all.js";
import runSystemUser, { setup as setupSystemUser, teardown as teardownSystemUser } from "./system-user/run-all.js";
import runSystemUserClientDelegation, { setup as setupSystemUserClientDelegation, teardown as teardownSystemUserClientDelegation } from "./system-user-client-delegation/run-all.js";
import runSystemUserRequest, { setup as setupSystemUserRequest, teardown as teardownSystemUserRequest } from "./system-user-request/run-all.js";
import runTokenExchange, { setup as setupTokenExchange } from "./token-exchange/run-all.js";

/**
 * k6 setup stage. Runs every folder's setup, keeping the results apart so each
 * folder still gets exactly the data it declared.
 *
 * The token exchange setup signs a Maskinporten grant, which is asynchronous, so
 * this one is awaited.
 *
 * @returns {Promise<object>} One entry per folder.
 */
export async function setup() {
    return {
        changeRequestSystemUser: setupChangeRequestSystemUser(),
        resourceRegistry: setupResourceRegistry(),
        systemRegister: await setupSystemRegister(),
        systemUser: setupSystemUser(),
        systemUserClientDelegation: setupSystemUserClientDelegation(),
        systemUserRequest: setupSystemUserRequest(),
        tokenExchange: await setupTokenExchange(),
    };
}

/**
 * Runs every authentication test in the repo once, in one k6 run.
 *
 * The folders each have a run-all.js of their own, which is the one to reach for
 * while working in a single folder. This is the one to reach for after touching
 * something they share: a client, a building block, a domain check or the barrel.
 *
 * It needs everything the individual tests need, which is the two platform urls,
 * the token generator credentials and the Maskinporten client the token exchange
 * and system register tests sign their grants with. Without the Maskinporten
 * secrets those two folders fail in their own setup and the rest still runs.
 *
 * @param {object} data Setup results, keyed per folder.
 */
export default async function (data) {
    runResourceRegistry();
    await runSystemRegister(data.systemRegister);
    runSystemUser(data.systemUser);
    runSystemUserRequest(data.systemUserRequest);
    runChangeRequestSystemUser(data.changeRequestSystemUser);
    runSystemUserClientDelegation(data.systemUserClientDelegation);
    runTokenExchange(data.tokenExchange);
}

/**
 * k6 teardown stage. Removes what the folders arranged, and sweeps up the systems
 * a failed step left in the register.
 *
 * @param {object} data Setup results, keyed per folder.
 */
export function teardown(data) {
    teardownChangeRequestSystemUser(data.changeRequestSystemUser);
    teardownSystemUser(data.systemUser);
    teardownSystemUserClientDelegation(data.systemUserClientDelegation);
    teardownSystemUserRequest(data.systemUserRequest);
    teardownSystemRegister(data.systemRegister);
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
