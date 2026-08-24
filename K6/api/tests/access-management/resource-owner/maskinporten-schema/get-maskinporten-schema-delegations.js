import exec from "k6/execution";

import { MaskinportenClient, MaskinportenDelegationsQueryBuilder } from "../../../../../clients/access-management/resource-owner/maskinporten/index.js";
import { MaskinportenDelegationsQuery } from "../../../../../clients/access-management/resource-owner/maskinporten/maskinporten.types.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator, randomIntBetween } from "../../../../../common-imports.js";
import { fetchTestData, getItemFromList, getNumberOfVUs, getOptions, pickUnique, requireEnv, segmentData } from "../../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../../scopes.js";
import { GetMaskinportenDelegations } from "../../../../building-blocks/access-management/resource-owner/maskinporten/index.js";

// Labels for different actions
const getMaskinportenSchemaLabel1 = { step: "1. Get maskinportenSchema supplierOrg as query param" };
const getMaskinportenSchemaLabel2 = { step: "2. Get maskinportenSchema supplierOrg and consumerOrg as query params" };
const getMaskinportenSchemaLabel3 = { step: "3. Get maskinportenSchema supplierOrg consumerOrg and scope as query params" };
const getMaskinportenSchemaLabel4 = { step: "4. Get maskinportenSchema supplierOrg and scope as query params" };
const getMaskinportenSchemaLabel5 = { step: "5. Get maskinportenSchema consumerOrg and scope as query params" };
const getMaskinportenSchemaLabel6 = { step: "6. Get maskinportenSchema consumerOrg as query param" };
const getMaskinportenSchemaLabel7 = { step: "7. Get maskinportenSchema scope as query param" };

const tokenGeneratorLabel = { token_generator: EnterpriseTokenGenerator.TAGS.getToken.token_generator };

const randomize = __ENV.RANDOMIZE ? __ENV.RANDOMIZE.toLowerCase() === "true" : true;

/**
 * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * @type {MaskinportenClient | undefined}
 */
let maskinportenClient = undefined;

const scopes = [
    "altinn:consentrequests.read",
    "altinn:consentrequests.write",
    "altinn:consenttokens",
    "dev:maskinporten/testapp10.read",
    "dev:maskinporten/testapp10.write",
    "dev:maskinporten/testapp1.read",
    "dev:maskinporten/testapp1.write",
    "dev:maskinporten/testapp2.read",
    "dev:maskinporten/testapp2.write",
    "dev:maskinporten/testapp3.read",
    "dev:maskinporten/testapp3.write",
    "dev:maskinporten/testapp4.read",
    "dev:maskinporten/testapp4.write",
    "dev:maskinporten/testapp5.read",
    "dev:maskinporten/testapp5.write",
    "dev:maskinporten/testapp6.read",
    "dev:maskinporten/testapp6.write",
    "dev:maskinporten/testapp7.read",
    "dev:maskinporten/testapp7.write",
    "dev:maskinporten/testapp8.read",
    "dev:maskinporten/testapp8.write",
    "dev:maskinporten/testapp9.read",
    "dev:maskinporten/testapp9.write",
];

// get k6 options
export const options = getOptions(
    [
        getMaskinportenSchemaLabel1,
        getMaskinportenSchemaLabel2,
        getMaskinportenSchemaLabel3,
        getMaskinportenSchemaLabel4,
        getMaskinportenSchemaLabel5,
        getMaskinportenSchemaLabel6,
        getMaskinportenSchemaLabel7,
        tokenGeneratorLabel,
    ],
);

/**
 * Setup function to segment data for VUs.
 *
 * @returns {any[][]} Organizations with a party uuid, one slice per VU.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    const numberOfVUs = getNumberOfVUs();
    const data = fetchTestData(`access-management/resource-owner/maskinporten-schema/${__ENV.ENVIRONMENT}.csv`);
    const segmentedData = segmentData(data, numberOfVUs);
    return segmentedData;
}

/**
 * Main function executed by each VU.
 */

export default function (data) {
    const segmentedData = data;
    const maskinportenSchemaApiClient = getClients();
    const [queryParams, label] = getQueryParams(segmentedData[exec.vu.idInTest - 1]);
    GetMaskinportenDelegations(maskinportenSchemaApiClient, queryParams, label);
}

/**
 * Creates and caches the client used to interact with the
 * Maskinporten Schema API.
 *
 * The client uses an enterprise token with the
 * `altinn:maskinporten/delegations.admin` scope. The same
 * {@link MaskinportenClient} instance is reused on subsequent calls.
 *
 * @returns {MaskinportenClient} The initialized API client.
 */
function getClients() {
    if (tokenGenerator == undefined) {
        const scopes = CreateScopeString([
            AltinnScopes.MASKINPORTEN.DELEGATIONS.ADMIN
        ]);
        const tokenOpts = new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .build();

        tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
    }

    if (maskinportenClient == undefined) {
        maskinportenClient = new MaskinportenClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return maskinportenClient;
}

/**
 * Picks one of the seven supported filter combinations at random and builds the
 * matching query parameters.
 *
 * @param {any[]} list Organizations available to this VU.
 * @returns {[MaskinportenDelegationsQuery, {[key: string]: string}]} The query
 * parameters and the label describing the combination.
 */
function getQueryParams(list) {
    const queryParams = new MaskinportenDelegationsQueryBuilder();
    let supplierOrg = undefined;
    /** @type {{[key: string]: string}} */
    let label = {};
    const randomValue = randomIntBetween(0, 6);
    switch (randomValue) {
        case 0:
            queryParams.withSupplierOrg(getOrganization(list, randomize).orgNo);
            label = getMaskinportenSchemaLabel1;
            break;
        case 1:
            supplierOrg = getOrganization(list, randomize);
            queryParams.withSupplierOrg(supplierOrg.orgNo);
            queryParams.withConsumerOrg(getOrganization(list, true, supplierOrg).orgNo);
            label = getMaskinportenSchemaLabel2;
            break;
        case 2:
            supplierOrg = getOrganization(list, randomize);
            queryParams.withSupplierOrg(supplierOrg.orgNo);
            queryParams.withConsumerOrg(getOrganization(list, true, supplierOrg).orgNo);
            queryParams.withScope(getItemFromList(scopes, true));
            label = getMaskinportenSchemaLabel3;
            break;
        case 3:
            queryParams.withSupplierOrg(getOrganization(list, randomize).orgNo);
            queryParams.withScope(getItemFromList(scopes, true));
            label = getMaskinportenSchemaLabel4;
            break;
        case 4:
            queryParams.withConsumerOrg(getOrganization(list, randomize).orgNo);
            queryParams.withScope(getItemFromList(scopes, true));
            label = getMaskinportenSchemaLabel5;
            break;
        case 5:
            queryParams.withConsumerOrg(getOrganization(list, randomize).orgNo);
            label = getMaskinportenSchemaLabel6;
            break;
        case 6:
            queryParams.withScope(getItemFromList(scopes, true));
            label = getMaskinportenSchemaLabel7;
            break;
        default:
            queryParams.withSupplierOrg(getOrganization(list, randomize).orgNo);
            label = getMaskinportenSchemaLabel1;
            break;
    }
    return [queryParams.build(), label];
}

function getOrganization(list, randomize = true, avoidItem = { ssn: "", orgNo: "" }) {
    if (!randomize) {
        return getItemFromList(list);
    }

    const filteredList = list.filter(
        item => !(item.ssn === avoidItem.ssn && item.orgNo === avoidItem.orgNo)
    );

    if (filteredList.length === 0) {
        throw new Error("No valid organizations available after applying avoidItem filter");
    }

    return pickUnique(filteredList, 1)[0]; // To avoid having to do const [org] = <...>
}
