import { check } from 'k6';
import { ConnectionsApiClient } from '../../../../clients/auth/index.js';

/**
 *
 * @param {ConnectionsApiClient} connectionsApiClient A client to interact with the enduser/connections API
 * @param {uuid} partyId - party id of the end user
 * @param {string} direction - from or to
 * @param {*} label - label for the request
 */
export function GetConnections(connectionsApiClient, queryParams, label = null) {
  const res = connectionsApiClient.GetConnections(queryParams, label);
  checker(res, 'GetConnections');
  return res.body;
}

/**
 *
 * @param {ConnectionsApiClient} connectionsApiClient A client to interact with the /enduser/connections API
 * @param {uuid} partyId - party id of the end user
 * @param {string} direction - from or to
 * @param {*} label - label for the request
 */
export function GetAccessPackages(connectionsApiClient, queryParams, label = null) {
  const res = connectionsApiClient.GetAccessPackages(queryParams, label);
  checker(res, 'GetAccessPackages');
  return res.body;
}

/**
 * Function to check common response properties
 * @param {} res - response object
 * @param {*} method - method name for logging
 */
function checker(res, method) {
  const succeed = check(res, {
    [`${method} - status code is 200`]: (r) => r.status === 200,
    [`${method} - status text is 200 OK`]: (r) => r.status_text == "200 OK",
    [`${method} - body is not empty and has correct response`]: (r) => {
      const res_body = JSON.parse(r.body);
      return res_body !== null && res_body !== undefined;
    }
  });
  if (!succeed) {
    console.log(res.status)
    console.log(res.body)
  };
}