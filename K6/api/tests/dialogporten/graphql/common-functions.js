import http from "k6/http";
import { GraphqlClient } from "../../../../clients/dialogporten/graphql/index.js";
import { PersonalTokenGenerator } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";

let graphqlClient = undefined;
let tokenGenerator = undefined;

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/dialogporten/endusers/${__ENV.ENVIRONMENT}/endusers.csv`);
    return parseCsvData(res.body);
}

export function getClient() {
    if (graphqlClient === undefined) {
        const baseUrl = __ENV.BASE_URL;
        const tokenOpts = getDialogportenOpts();
        tokenGenerator = new PersonalTokenGenerator(tokenOpts);
        graphqlClient = new GraphqlClient(baseUrl, tokenGenerator);
    }
    return [graphqlClient, tokenGenerator];
}

export function getDialogportenOpts(ssn = null) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "digdir:dialogporten");
    if (ssn !== null) {
        tokenOpts.set("pid", ssn);
    }
    return tokenOpts;
}