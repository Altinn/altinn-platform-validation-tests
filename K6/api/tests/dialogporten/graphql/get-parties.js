/**
 * This test retrieves the parties associated with an end user. The test uses a GraphQL query to fetch the parties and their details. 
 * The end user's social security number (SSN) is randomly selected from a list of test data. 
 * The test also includes options for randomization and labeling for better organization and reporting.
 * Currently not running scheduled in pipeline, but can be used for manual testing and performance testing of the GetParties GraphQL query.
 */
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
