import http from "k6/http";
import { Trend } from "k6/metrics";
import { PersonalTokenGenerator, randomItem } from "../../../../common-imports.js";
import { SystemUserClientsRequestApiClient } from "../../../../clients/auth/index.js";
import { SystemUserClientsRequest } from "../../../building-blocks/auth/system-user-request/index.js";
import { parseCsvData } from "../../../../helpers.js";

const randomize = (__ENV.RANDOMIZE ?? "false") === "true";

const systemOwner = {
  partyId: "57943561",
  pid: "20041065185",
  userId: "1282457",
  orgUuid: "c27c7679-779e-4d79-a1dd-dccf2fe80f3e",
}

const lessThan1000 = new Trend("a_less_than_1000");
const between1000And2000 = new Trend("b_between_1000_and_2000");
const between2000And5000 = new Trend("c_between_2000_and_5000");
const between5000And10000 = new Trend("d_between_5000_and_10000");
const between10000And20000 = new Trend("e_between_10000_and_20000");
const moreThan20000 = new Trend("f_more_than_20000");

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
};

export function setup() {
  //K6/testdata/auth/system-users-with-delegations-yt01.csv
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/create-approve-systemuser-revisited/K6/testdata/auth/system-users-with-delegations-${__ENV.ENVIRONMENT}.csv`);
    if (res.status !== 200) {
      throw new Error(`Failed to fetch test data CSV. Status: ${res.status}`);
    }
    return parseCsvData(res.body);
}

export default function (data) {
    let testCustomer = undefined;
    if (randomize) {
      testCustomer = randomItem(data);
    } else {
      testCustomer = data[__ITER % data.length];
    }

    console.log(testCustomer);
    const options = new Map();
    options.set("env", __ENV.ENVIRONMENT);
    options.set("ttl", 3600);
    options.set("scopes", "altinn:portal/enduser altinn:clientdelegations.read");
    options.set("pid", systemOwner.pid);
    options.set("userId", systemOwner.userId);
    options.set("partyId", systemOwner.partyId);
    options.set("partyuuid", systemOwner.orgUuid);

    const tokenGenerator
        = new PersonalTokenGenerator(options);

    const systemUserClientsRequestApiClient
        = new SystemUserClientsRequestApiClient(__ENV.BASE_URL, tokenGenerator);

    const res = SystemUserClientsRequest(systemUserClientsRequestApiClient, testCustomer.systemuserUuid);
    putInCorrectMetric(res.json().data.length, res.timings.duration);
    
  }

  function putInCorrectMetric(customers, duration) {
    if (customers < 1000) {
      lessThan1000.add(duration);
    } else if (customers >= 1000 && customers < 2000) {
      between1000And2000.add(duration);
    } else if (customers >= 2000 && customers < 5000) {
      between2000And5000.add(duration);
    } else if (customers >= 5000 && customers < 10000) {
      between5000And10000.add(duration);
    } else if (customers >= 10000 && customers < 20000) {
      between10000And20000.add(duration);
    } else {
      moreThan20000.add(duration);
    }
  }
  