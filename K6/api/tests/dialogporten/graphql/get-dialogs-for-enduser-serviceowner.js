/**
 * This test gets all dialogs for a random end user from a random serviceOwner
 */

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
import { serviceOwners } from "./service-owners.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { action: "1. get-dialogs-for-enduser-serviceowners" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize).ssn;
    const serviceOwner = getItemFromList(serviceOwners, randomize);
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    const variables = new DialogSearchVariablesBuilder()
        .withParties([endUser])
        .withOrg([serviceOwner])
        .build();
    GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
}
