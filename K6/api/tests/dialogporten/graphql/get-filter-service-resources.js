/**
 * This test is used to get the filter service resources from Dialogporten GraphQL API.
 * It uses the GetFilterServiceResources function from the building-blocks/dialogporten/graphql/index.js file.
 */
import { getItemFromList, getOptions } from "../../../../helpers.js";
import { GetFilterServiceResources } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const getFilterServiceResourcesLabel = { step: "1. get-filter-service-resources" };

export const options = getOptions([
    getFilterServiceResourcesLabel,
]);

export default function (data) {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = getItemFromList(data, randomize).ssn;
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    GetFilterServiceResources(
        graphqlClient,
        getFilterServiceResourcesLabel,
    );
}
