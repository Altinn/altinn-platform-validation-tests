import { check, fail } from "k6";
import { SystemUserClientsRequestApiClient } from "../../../../clients/auth/index.js";

/**
 * Creates a new Request based on a SystemId for a SystemUser.
 * @param {SystemUserClientsRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string } systemId
 * @param {string } partyOrgNo
 * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
 * @param {string } redirectUrl
 * @param {Array<{ urn: string }> } accessPackages
 * @returns (string | ArrayBuffer | null)
 */
export function SystemUserClientsRequest(
    systemUserRequestApiClient,
    systemId,
) {
    const res = systemUserRequestApiClient.SystemUserClientsRequest(
        systemId,
    );
    if (!check(res, {
        "CreateSystemUserClientsRequest - status code is 200": (r) => r.status === 200,
    })) {
        if ((res.status.toString().startsWith("4") || res.status.toString().startsWith("5")) && res.body !== null) {
            console.log(res.body);
        }
        fail(`SysteUserClientsRequests - Unexpected status: '${res.status}' or status_text: '${res.status_text}'`);
    };

    if (!check(res, {
        "SystemUserClientsRequest - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    })) {
        fail(`SystemUserClientsRequest - Unexpected body: '${res.body}'`);
    };
    return res;
}
