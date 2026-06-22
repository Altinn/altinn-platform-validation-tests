import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetParties } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getPartiesLabel = { action: "1. get-parties-for-enduser" };

export const options = getOptions([
    getPartiesLabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize).ssn;
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    GetParties(
        graphqlClient,
        getPartiesLabel,
    );
}
