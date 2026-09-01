import runChangeRequestSystemUser, { setup as setupChangeRequestSystemUser, teardown as teardownChangeRequestSystemUser } from "./change-request-system-user/run-all.js";
import runIntrospection, { setup as setupIntrospection } from "./introspection/run-all.js";
import runOpenid, { setup as setupOpenid } from "./openid/run-all.js";
import runSystemRegister, { setup as setupSystemRegister, teardown as teardownSystemRegister } from "./system-register/run-all.js";
import runSystemUser, { setup as setupSystemUser, teardown as teardownSystemUser } from "./system-user/run-all.js";
import runSystemUserClientDelegation, { setup as setupSystemUserClientDelegation, teardown as teardownSystemUserClientDelegation } from "./system-user-client-delegation/run-all.js";
import runSystemUserRequest, { setup as setupSystemUserRequest, teardown as teardownSystemUserRequest } from "./system-user-request/run-all.js";
import runSystemUserToken, { setup as setupSystemUserToken, teardown as teardownSystemUserToken } from "./system-user-token/run-all.js";
import runTokenExchange, { setup as setupTokenExchange } from "./token-exchange/run-all.js";

/**
 * k6 setup stage. Runs every folder's setup, keeping the results apart so each
 * folder still gets exactly the data it declared.
 *
 * The token exchange setup signs a Maskinporten grant, which is asynchronous, so
 * this one is awaited.
 *
 * @returns One entry per folder.
 */
export async function setup() {
    return {
        changeRequestSystemUser: setupChangeRequestSystemUser(),
        introspection: setupIntrospection(),
        openid: setupOpenid(),
        systemRegister: await setupSystemRegister(),
        systemUser: setupSystemUser(),
        systemUserClientDelegation: setupSystemUserClientDelegation(),
        systemUserRequest: setupSystemUserRequest(),
        systemUserToken: setupSystemUserToken(),
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
 * Two folders want more than that. The pdp sits behind API management, so the
 * decision tests want AUTHORIZATION_SUBSCRIPTION_KEY, and the client delegation one
 * only has a resource to ask about in at22 and tt02. The system user token folder
 * runs in tt02 alone, since that is the Altinn environment Maskinporten looks system
 * users up in, and its setup stops the run anywhere else.
 *
 * @param {Awaited<ReturnType<typeof setup>>} data Setup results, keyed per folder.
 */
export default async function (data) {
    await runSystemRegister(data.systemRegister);
    runSystemUser(data.systemUser);
    runSystemUserRequest(data.systemUserRequest);
    runChangeRequestSystemUser(data.changeRequestSystemUser);
    runSystemUserClientDelegation(data.systemUserClientDelegation);
    await runSystemUserToken(data.systemUserToken);
    runTokenExchange(data.tokenExchange);
    runIntrospection();
    runOpenid();
}

/**
 * k6 teardown stage. Removes what the folders arranged, and sweeps up the systems
 * a failed step left in the register.
 *
 * The system register teardown is awaited: it signs its own Maskinporten grant
 * rather than reusing the one setup fetched, since by the time an aggregate run
 * gets here that one can have expired.
 *
 * @param {Awaited<ReturnType<typeof setup>>} data Setup results, keyed per folder.
 * @returns {Promise<void>} Resolves once every folder has been torn down.
 */
export async function teardown(data) {
    teardownChangeRequestSystemUser(data.changeRequestSystemUser);
    teardownSystemUser(data.systemUser);
    teardownSystemUserClientDelegation(data.systemUserClientDelegation);
    teardownSystemUserRequest(data.systemUserRequest);
    teardownSystemUserToken(data.systemUserToken);
    await teardownSystemRegister();
}

// Shared end-of-test summary logging (prints check pass/fail counts).
export { handleSummary } from "../../../common-imports.js";
