import { check } from "k6";
import { AccessPackageApiClient } from "../../../../clients/authentication/index.js";

/**
 * 
 * @param {AccessPackageApiClient} accessPackageApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function PostDelegations(accessPackageApiClient, queryParams, label = null) {
    const res = accessPackageApiClient.PostDelegations(queryParams, label);
    const succeed = check(res, {
        "PostDelegations - status code is 200": (r) => r.status === 200,
        "PostDelegations - status text is 200 OK": (r) => r.status_text == "200 OK",
        "PostDelegations - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    }
    return res.body;
}

/**
 * 
 * @param {AccessPackageApiClient} accessPackageApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function DeleteDelegations(accessPackageApiClient, queryParams, label = null) {
  const res = accessPackageApiClient.DeleteDelegations(queryParams, label);
  const succeed = check(res, {
      "DeleteDelegations - status code is 200": (r) => r.status === 200,
      "DeleteDelegations - status text is 200 OK": (r) => r.status_text == "200 OK",
      "DeleteDelegations - body is not empty": (r) => {
          const res_body = JSON.parse(r.body);
          return res_body !== null && res_body !== undefined;
      }
  });

  if (!succeed) {
      console.log(res.status);
      console.log(res.status_text);
      console.log(res.body);
  }
  return res.body;
}

/**
 * 
 * @param {AccessPackageApiClient} accessPackageApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function GetDelegationCheck(accessPackageApiClient, queryParams, label = null) {
  const res = accessPackageApiClient.GetDelegationCheck(queryParams, label);
  const succeed = check(res, {
      "GetDelegationCheck - status code is 200": (r) => r.status === 200,
      "GetDelegationCheck - status text is 200 OK": (r) => r.status_text == "200 OK",
      "GetDelegationCheck - body is not empty": (r) => {
          const res_body = JSON.parse(r.body);
          return res_body !== null && res_body !== undefined;
      }
  });

  if (!succeed) {
      console.log(res.status);
      console.log(res.status_text);
      console.log(res.body);
  }
  return res.body;
}

/**
 * 
 * @param {AccessPackageApiClient} accessPackageApiClient A client to interact with the /accesspackage API
 * 
 * @returns (string | ArrayBuffer | null)
 */
export function GetPermission(accessPackageApiClient, accessPackageId, queryParams, label = null) {
  const res = accessPackageApiClient.GetPermission(accessPackageId, queryParams, label);
  const succeed = check(res, {
      "GetPermission - status code is 200": (r) => r.status === 200,
      "GetPermission - status text is 200 OK": (r) => r.status_text == "200 OK",
      "GetPermission - body is not empty": (r) => {
          const res_body = JSON.parse(r.body);
          return res_body !== null && res_body !== undefined;
      }
  });

  if (!succeed) {
      console.log(res.status);
      console.log(res.status_text);
      console.log(res.body);
  }
  return res.body;
}
