/**
 * This test gets all dialogs for a given end user. The end user is randomly picked from the provided data.
 */

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { action: "1. get-dialogs-for-enduser" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize).ssn;
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    const variables = new DialogSearchVariablesBuilder()
        .withParties([endUser])
        .build();
    const res = GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
    const json = JSON.parse(res);
    console.log(`Got ${json.data.searchDialogs?.items?.length} dialogs for end user ${endUser}`);
}
