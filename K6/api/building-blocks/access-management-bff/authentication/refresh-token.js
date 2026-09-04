import { check } from "k6";

import { AuthenticationClient } from "../../../../clients/access-management-bff/authentication/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Refreshes the authentication cookie of the authenticated user.
 *
 * @param {AuthenticationClient} authenticationClient Client for the
 * authentication endpoints.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the token was refreshed.
 */
export function RefreshToken(authenticationClient, labels = null) {
    const res = withRetries(
        () => authenticationClient.RefreshToken(labels),
        "RefreshToken",
    );

    let refreshed = false;

    const succeed = check(res, {
        "RefreshToken - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return refreshed;
    }

    refreshed = true;

    return refreshed;
}
