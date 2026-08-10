import { check } from "k6";

import { AuthenticationClient } from "../../../../clients/access-management-bff/authentication/index.js";

/**
 * Refreshes the authentication cookie of the authenticated user.
 *
 * @param {AuthenticationClient} authenticationClient Client for the
 * authentication endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the token was refreshed.
 */
export function RefreshToken(authenticationClient, labels = null) {
    const res = authenticationClient.RefreshToken(labels);

    let refreshed = false;

    const succeed = check(res, {
        "RefreshToken - status code is 200": (r) =>
            r.status === 200,
        "RefreshToken - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return refreshed;
    }

    refreshed = true;

    return refreshed;
}
