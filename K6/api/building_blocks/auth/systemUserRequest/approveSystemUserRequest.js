import { check } from 'k6';
import { SystemUserRequestApiClient } from "../../../../clients/auth/index.js"

/**
 * Create a new System
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string } systemId
 * @param {string } partyOrgNo
 * @param {Array<{resource: Array<{value: string, id: string}>}>} rights
 * @param {string } redirectUrl
 * @param {Array<{ urn: string }> } accessPackages
 * @returns (string | ArrayBuffer | null)
 */
export function ApproveSystemUserRequest(
    systemUserRequestApiClient,
    partyId,
    requestId
) {
    const res = systemUserRequestApiClient.ApproveSystemUserRequest(
        partyId,
        requestId
    )
    check(res, {
        'ApproveSystemUserRequest - status code is 200': (r) => r.status === 200,
        'ApproveSystemUserRequest - status text is 200 OK': (r) => r.status_text == "200 OK",
        'ApproveSystemUserRequest - body is not empty': (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    return res.body
}
