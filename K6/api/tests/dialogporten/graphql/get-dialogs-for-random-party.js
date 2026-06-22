/**
 * @description This test retrieves all dialogs for a random party associated with the end user.
 * It first fetches the parties linked to the end user and then selects one party at random to retrieve its dialogs.
 * The test uses GraphQL queries to interact with the Dialogporten API and includes options for randomization and labeling for better organization and reporting.
 */

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts, getParties } from "./common-functions.js";
import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getPartiesLabel = { action: "1. get-parties-for-enduser" };
const getDialogslabel = { action: "2. get-dialogs-party" };

export const options = getOptions([
    getPartiesLabel,
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize).ssn;
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    const party = getItemFromList(getParties(graphqlClient, getPartiesLabel), true);
    const variables = new DialogSearchVariablesBuilder()
        .withPartyURIs([party])
        .build();

    GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
}
