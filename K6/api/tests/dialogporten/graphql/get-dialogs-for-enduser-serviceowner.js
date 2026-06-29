/**
 * This test gets all dialogs for a random end user from a random serviceOwner
 */

import { DialogSearchVariablesBuilder } from "../../../../clients/dialogporten/graphql/dialogs-search-variables-builder.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetAllDialogsForParty } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
import { serviceOwners } from "./service-owners.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs-for-enduser-serviceowners" };

export const options = getOptions([
    getDialogslabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize);
    const serviceOwner = getItemFromList(serviceOwners, randomize);
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser.ssn));
    const variables = new DialogSearchVariablesBuilder()
        .withParties([endUser.ssn])
        .withOrg([serviceOwner])
        .build();
    GetAllDialogsForParty(
        graphqlClient,
        variables,
        getDialogslabel,
    );
}
