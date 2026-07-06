import { check, fail } from "k6";

import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";

/**
 * Creates a new Request based on a SystemId for a SystemUser.
 *
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string } systemId TODO: description
 * @param {string } partyOrgNo TODO: description
 * @param {Array<{resource: Array<{value: string, id: string}>}>} rights TODO: description
 * @param {string } redirectUrl TODO: description
 * @param {Array<{ urn: string }> } accessPackages TODO: description
 * @returns (string | ArrayBuffer | null)
 */
export function CreateSystemUserRequest(
    systemUserRequestApiClient,
    systemId,
    partyOrgNo,
    rights = [],
    redirectUrl = "",
    accessPackages = []
) {
    const res = systemUserRequestApiClient.CreateSystemUserRequest(
        systemId,
        partyOrgNo,
        rights,
        redirectUrl,
        accessPackages
    );
    if (!check(res, {
        "CreateSystemUserRequest - status code is 201": (r) => r.status === 201,
        "CreateSystemUserRequest - status text is 201 Created": (r) => r.status_text == "201 Created",
    })) {
        if ((res.status.toString().startsWith("4") || res.status.toString().startsWith("5")) && res.body !== null) {
            console.log(res.body);
        }
        fail(`CreateSystemUserRequest - Unexpected status: '${res.status}' or status_text: '${res.status_text}'`);
    };

    if (!check(res, {
        "CreateSystemUserRequest - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    })) {
        fail(`CreateSystemUserRequest - Unexpected body: '${res.body}'`);
    };
    return res.body;
}
