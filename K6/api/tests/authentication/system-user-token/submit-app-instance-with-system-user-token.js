import { fail, group } from "k6";

import { BrukermonsterTestAppClient } from "../../../../clients/apps/brukermonster-test-app/index.js";
import { appsBaseUrl, getItemFromList, lazy } from "../../../../helpers.js";
import { AltinnScopes } from "../../../../scopes.js";
import { AuthenticationBuildingBlocks } from "../../../authentication-imports.js";
import { CreateNewInstance, MoveInstanceToNextProcessStep } from "../../../building-blocks/apps/brukermonster-test-app/index.js";
import { AppProcessDomainChecks } from "../../../domain-checks/apps/process.js";
import { fetchSystemUserToken, getClients } from "./commons.js";

export { setup, teardown } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

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

    return { tokenGenerator, appClient: new BrukermonsterTestAppClient(appsBaseUrl("ttd", __ENV.ENVIRONMENT), tokenGenerator) };
});

/**
 * Test: a system user can submit an instance of an Altinn app.
 *
 * The app requires authentication level 4 in general and 3 for system users, and
 * gives the jordbruk access package the right to instantiate, write and read. The
 * system user setup arranges has jordbruk on the customer, so it gets in on the
 * system user obligation alone.
 *
 * The apps host follows ENVIRONMENT, which setup has already required.
 *
 * @param {ReturnType<typeof import("./commons.js").setup>} data The arranged system users from setup.
 */
export default async function (data) {
    // Empty outside tt02, where setup has nothing to arrange. See its comment.
    if ((data ?? []).length === 0) {
        return;
    }

    const arranged = getItemFromList(data, randomize);
    const systemUserToken = await fetchSystemUserToken(arranged, [AltinnScopes.INSTANCES.READ, AltinnScopes.INSTANCES.WRITE]);
    const { clients } = getClients();

    const altinnToken = AuthenticationBuildingBlocks.ExchangeToken(clients.authenticationClient, "maskinporten", { token: systemUserToken });

    if (!altinnToken) {
        fail("cannot call the app: the system user token could not be exchanged for an Altinn token");
    }

    const { tokenGenerator, appClient } = getAppClients();
    tokenGenerator.token = altinnToken;

    group("As a system user, I can submit an instance of an app", function () {
        const instance = CreateNewInstance(appClient, {
            instanceOwner: { partyId: String(arranged.customer.orgPartyId) },
        });

        if (!instance?.id) {
            fail("cannot submit: the app did not create an instance");
        }

        const [instanceOwnerPartyId, instanceGuid] = instance.id.split("/");

        const processState = MoveInstanceToNextProcessStep(appClient, instanceOwnerPartyId, instanceGuid);

        AppProcessDomainChecks.CheckInstanceSubmitted(processState);
    });
}
