/**
 * @description This test retrieves all dialogs for multiple parties associated with the end user. Max number of parties can be set with the MAX_NUMBER_OF_PARTIES environment variable, default is 100.
 * The test first fetches the parties linked to the end user and then retrieves dialogs for all those parties.
 * The test uses GraphQL queries to interact with the Dialogporten API and includes options for randomization and labeling for better organization and reporting.
 */
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts, getParties } from "./common-functions.js";
import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const max_number_of_parties = __ENV.MAX_NUMBER_OF_PARTIES ? parseInt(__ENV.MAX_NUMBER_OF_PARTIES) : 100;

const getPartiesLabel = { step: "1. get-parties-for-enduser" };
const getDialogslabel = { step: "2. get-dialogs-parties" };

export const options = getOptions([
    getPartiesLabel,
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize);
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser.ssn));
    const parties = getParties(graphqlClient, getPartiesLabel, max_number_of_parties);
    const variables = new DialogSearchVariablesBuilder()
        .withPartyURIs(parties)
        .build();

    GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
}
