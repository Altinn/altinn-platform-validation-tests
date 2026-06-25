/**
 * This test gets all dialogs for a set of parties for a end user from a random service owner.
 */

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts, getParties } from "./common-functions.js";
import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
import { serviceOwners } from "./service-owners.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const max_number_of_parties = __ENV.MAX_NUMBER_OF_PARTIES ? parseInt(__ENV.MAX_NUMBER_OF_PARTIES) : 100;

const getPartiesLabel = { step: "1. get-parties-for-enduser" };
const getDialogslabel = { step: "2. get-dialogs-for-enduser-serviceowners" };

export const options = getOptions([
    getPartiesLabel,
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize);
    const serviceOwner = getItemFromList(serviceOwners, randomize);
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser.ssn));
    const parties = getParties(graphqlClient, getPartiesLabel, max_number_of_parties);
    const variables = new DialogSearchVariablesBuilder()
        .withPartyURIs(parties)
        .withOrg([serviceOwner])
        .build();
    GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
}
