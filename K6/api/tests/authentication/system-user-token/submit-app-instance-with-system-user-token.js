import { fail, group } from "k6";

import { InstancesClient } from "../../../../clients/apps/index.js";
import { getItemFromList, lazy, requireEnv } from "../../../../helpers.js";
import { AltinnScopes } from "../../../../scopes.js";
import { AuthenticationBuildingBlocks } from "../../../authentication-imports.js";
import { CreateNewInstance, MoveInstanceToNextProcessStep } from "../../../building-blocks/apps/index.js";
import { AppProcessDomainChecks } from "../../../domain-checks/apps/process.js";
import { fetchSystemUserToken, getClients } from "./commons.js";

export { setup, teardown } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const ORG = "ttd";
const APP = "brukermonster-test-app";

/**
 * The app client, and the token it calls with.
 *
 * The token is the exchanged system user token, which the test sets per iteration
 * rather than a generator mints.
 */
const getAppClients = lazy(function () {
    const tokenGenerator = {
        /** @type {string|null} */
        token: null,
        getToken() {
            return this.token;
        },
    };

    return { tokenGenerator, instancesClient: new InstancesClient(__ENV.APPS_URL, tokenGenerator) };
});

/**
 * Test: a system user can submit an instance of an Altinn app.
 *
 * The app requires authentication level 4 in general and 3 for system users, and
 * gives the jordbruk access package the right to instantiate, write and read. The
 * system user setup arranges has jordbruk on the customer, so it gets in on the
 * system user obligation alone.
 *
 * The apps host comes from APPS_URL in functional.yaml. It is required after the skip
 * below rather than in setup, so run-all one level up still skips outside tt02.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The arranged system users from setup.
 */
export default async function (data) {
    // Empty outside tt02, where setup has nothing to arrange. See its comment.
    if ((data ?? []).length === 0) {
        return;
    }

    requireEnv(["APPS_URL"]);
    const arranged = getItemFromList(data, randomize);
    const systemUserToken = await fetchSystemUserToken(arranged, [AltinnScopes.INSTANCES.READ, AltinnScopes.INSTANCES.WRITE]);
    const { clients } = getClients();

    const altinnToken = AuthenticationBuildingBlocks.ExchangeToken(clients.authenticationClient, "maskinporten", { token: systemUserToken });

    if (!altinnToken) {
        fail("cannot call the app: the system user token could not be exchanged for an Altinn token");
    }

    const { tokenGenerator, instancesClient } = getAppClients();
    tokenGenerator.token = altinnToken;

    group("As a system user, I can submit an instance of an app", function () {
        const instance = CreateNewInstance(instancesClient, ORG, APP, {
            instanceOwner: { partyId: String(arranged.customer.orgPartyId) },
        });

        if (!instance?.id) {
            fail("cannot submit: the app did not create an instance");
        }

        const [instanceOwnerPartyId, instanceGuid] = instance.id.split("/");

        const processState = MoveInstanceToNextProcessStep(instancesClient, ORG, APP, instanceOwnerPartyId, instanceGuid);

        AppProcessDomainChecks.CheckInstanceSubmitted(processState);
    });
}
