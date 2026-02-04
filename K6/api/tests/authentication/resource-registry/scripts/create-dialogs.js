/*
* STILL UNDER DEVELOPMENT
* Script to create dialogs in Dialogporten for various resources using K6 performance testing tool.
* Run: k6 run create-dialogs.js
* Set environment variables:
*   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
*   BASE_URL - the base URL of the Dialogporten Service Owner API
* Example:
*   ENVIRONMENT=yt01 BASE_URL=https://platform.at22.altinn.cloud k6 run create-dialogs.js
* TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must also be set in the environment for token generation
*/
import http from "k6/http";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { CreateDialog } from "../../../../building-blocks/dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../../clients/dialogporten/serviceowner/index.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../../helpers.js";

const resources = [
    "k6-test-innbygger-forsikring",
    "k6-test-innbygger-patent",
    "k6-test-innbygger-sykefravaer",
    "k6-test-innbygger-attester",
    "k6-test-innbygger-helsetjenester",
    "k6-test-innbygger-bolig-eiendom",
    "k6-test-innbygger-byggesoknad",
    "k6-test-innbygger-pensjon",
    "k6-test-innbygger-sertifisering",
    "k6-test-innbygger-vapen",
    "k6-test-innbygger-arbeidsliv",
    "k6-test-innbygger-stotte-tilskudd",
    "k6-test-innbygger-straffesak",
    "k6-test-innbygger-tilgangsstyring-privatperson",
    "k6-test-innbygger-bank-finans",
    "k6-test-innbygger-utdanning",
    "k6-test-innbygger-soknader-sertifisering",
    "k6-test-innbygger-kjoretoy",
    "k6-test-innbygger-forerkort",
    "k6-test-innbygger-skatteforhold-privatpersoner",
    "k6-test-innbygger-samliv",
    "k6-test-innbygger-barn-foreldre",
    "k6-test-innbygger-permisjon-oppsigelse",
    "k6-test-innbygger-barnehage-sfo-skole",
    "k6-test-innbygger-fritidsaktiviteter-friluftsliv",
    "k6-test-innbygger-avlastning-stotte",
    "k6-test-innbygger-design-varemerke",
    "k6-test-innbygger-kultur",
    "k6-test-innbygger-pleie-omsorg",
    "k6-test-innbygger-toll-avgift",
    "k6-test-innbygger-idrett",
    "k6-test-innbygger-behandling",
    "k6-test-innbygger-loyve",
];

const orgNo = "713431400"; //"991825827"; //
let serviceOwnerApiClient = undefined;
const label = "create-dialog";

export function setup() {
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`);
  return parseCsvData(res.body);
}

/**
* Function to set up and return clients to interact with the Service Owner Dialog API
*
* @returns {Array} An array containing the AuthorizedPartiesClient instance
*/
export function getClients() {
  if (serviceOwnerApiClient == undefined) {
      const tokenOpts = new Map();
      tokenOpts.set("env", __ENV.ENVIRONMENT);
      tokenOpts.set("ttl", 3600);
      tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider");
      tokenOpts.set("org", "ttd");
      tokenOpts.set("orgNo", orgNo);
      const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
      serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
  }
  return [serviceOwnerApiClient];
}

export default function (data) {
  const [serviceOwnerApiClient] = getClients();
  const ssn = "06925398878"; //data[0].ssn;
  const resource = "k6-test-innbygger-vapen"; //"k6-test-innbygger-vapen"; 
  //const resource = resources[0];
  console.log(`Creating dialog for ssn: ${ssn} and resource: ${resource}`);
  CreateDialog(
      serviceOwnerApiClient,
      ssn,
      resource,
      orgNo,
      label,
      false,
      "Dialog for access package"
  );
}