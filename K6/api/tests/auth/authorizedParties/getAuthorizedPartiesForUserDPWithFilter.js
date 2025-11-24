
import http from "k6/http";
import { GetAuthorizedParties } from "../../../building_blocks/auth/authorizedParties/index.js";
import { getClients } from "./commonFunctions.js";
import { getItemFromList, getOptions, readCsv, parseCsvData } from "../../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";
const lengthPartyFilter = (__ENV.LENGTH_PARTY_FILTER ?? "25");

//const filename2 = `../../../../testdata/auth/party-avgivere-${__ENV.ENVIRONMENT}.csv`;
//const data = readCsv(filename2);
const label = "getAuthorizedPartiesForUser";

export const options = getOptions([label]);

export default function (data) {
  const [authorizedPartiesClient] = getClients();
  const userParty = getItemFromList(data, randomize);
  const queryParams = {
      includeAltinn2: true,
      includeAltinn3: true,
      includeRoles: true,
      includeAccessPackages: true,
      includeResources: true,
      includeInstances: true
  };

  const partyFilter = getPartyFilter(userParty.avgivere, lengthPartyFilter, userParty.ssn);
  
  GetAuthorizedParties(
      authorizedPartiesClient,
      "urn:altinn:person:identifier-no",
      userParty.ssn,
      queryParams,
      label,
      partyFilter
  );
}

function getPartyFilter(partyString, length, ssn) {
  const parties = partyString.split(" ").slice(0, length);
  const result = [{ type: "urn:altinn:person:identifier-no", value: ssn }];
  for (const party of parties) {
      const [type, id] = party.split(":");
      if (type === "org") {
          result.push({ type: "urn:altinn:organization:identifier-no", value: id });
      } else if (type === "person") {
          result.push({ type: "urn:altinn:person:identifier-no", value: id });
      }
  }
  return result;
}

export function setup() {
  const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/auth/party-avgivere-${__ENV.ENVIRONMENT}.csv`);
  return parseCsvData(res.body);
}