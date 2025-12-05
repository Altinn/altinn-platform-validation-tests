import { check } from "k6";
import { SystemUserRequestApiClient } from "../../../../clients/auth/index.js";

/**
 * Create a new Agent System User Request
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string } externalRef
 * @param {string } systemId
 * @param {string} partyOrgNo
 * @param {Array<{ urn: string }> } accessPackages
 * @param {string } redirectUrl
 * @returns (string | ArrayBuffer | null)
 */
export function CreateAgentSystemUserRequest(
    systemUserRequestApiClient,
    externalRef,
    systemId,
    partyOrgNo,
    accessPackages = [],
    redirectUrl = "",
) {
    const res = systemUserRequestApiClient.CreateAgentSystemUserRequest(
        externalRef,
        systemId,
        partyOrgNo,
        accessPackages,
        redirectUrl,
    );

    check(res, {
        "CreateAgentSystemUserRequest - status code is 201": (r) => r.status === 201,
        "CreateAgentSystemUserRequest - status text is 200 OK": (r) => r.status_text == "201 Created",
        "CreateAgentSystemUserRequest - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        },
        "CreateAgentSystemUserRequest - body includes confirmUrl": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined && "confirmUrl" in res_body;
        }
    });
    return res.body;
}
