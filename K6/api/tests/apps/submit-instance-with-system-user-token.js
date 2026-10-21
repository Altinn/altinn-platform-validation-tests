import { check, fail, group } from "k6";

import { DataClient, InstancesClient, ProcessClient } from "../../../clients/apps/index.js";
import { getItemFromList } from "../../../helpers.js";
import { AltinnScopes } from "../../../scopes.js";
import { AuthenticationBuildingBlocks } from "../../authentication-imports.js";
import { NextElement, PostSimplified, Put } from "../../building-blocks/apps/index.js";
import { fetchSystemUserToken, getClients } from "../authentication/system-user-token/commons.js";

export { setup, teardown } from "../authentication/system-user-token/commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const APPS_URL = "https://ttd.apps.tt02.altinn.no";
const ORG = "ttd";
const APP = "brukermonster-test-app";

/**
 * Test: a system user can fill in and submit an instance of an Altinn app.
 *
 * The app requires authentication level 4 in general and 3 for system users, and
 * gives the jordbruk access package the right to instantiate, write and read. The
 * system user setup arranges has jordbruk on the customer, so it gets in on the
 * system user obligation alone.
 *
 * @param {ReturnType<typeof import("../authentication/system-user-token/commons.js").setup>} data The arranged system users from setup.
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

    const tokenGenerator = { getToken: () => altinnToken };
    const instancesClient = new InstancesClient(APPS_URL, tokenGenerator);
    const dataClient = new DataClient(APPS_URL, tokenGenerator);
    const processClient = new ProcessClient(APPS_URL, tokenGenerator);

    group("As a system user, I can fill in and submit an instance of an app", function () {
        const instance = PostSimplified(instancesClient, ORG, APP, {
            instanceOwner: { organisationNumber: arranged.customer.orgNo },
        });

        const modelElement = instance?.data?.find((dataElement) => dataElement.dataType === "model");

        if (!instance?.id || !modelElement?.id) {
            fail("cannot submit: the app did not create an instance with a model to fill in");
        }

        const instanceOwnerPartyId = Number(instance.instanceOwner.partyId);
        const instanceGuid = instance.id.split("/")[1];

        Put(dataClient, ORG, APP, instanceOwnerPartyId, instanceGuid, modelElement.id, {
            property1: "Utfylt av systembruker",
            property2: arranged.systemUserId,
        });

        const processState = NextElement(processClient, ORG, APP, instanceOwnerPartyId, instanceGuid);

        check(processState, {
            "the instance is submitted": (state) => Boolean(state?.ended),
        });
    });
}
