/**
 * This test gets all dialogs for a given end user. The end user is randomly picked from the provided data.
 */

import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/enduser/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
import { DialogSearchParamsBuilder } from "../../../../clients/dialogporten/enduser/index.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getDialogslabel = { step: "1. get-dialogs-for-enduser" };

export const options = getOptions([getDialogslabel]);

export default function (data) {
  const [enduserApiClient, tokenGenerator] = getClient();
  const endUser = getItemFromList(data, randomize);
  tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser.ssn));
  const variables = new DialogSearchParamsBuilder()
    .withParties([endUser.ssn])
    .build();
  GetDialogs(enduserApiClient, variables, getDialogslabel);
}
