import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes an actor from the favourites of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} partyUuid Party UUID of the actor.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the actor was removed from the favourites.
 */
export function DeleteFavorite(userClient, partyUuid, labels = null) {
    const res = withRetries(
        () => userClient.DeleteFavorite(partyUuid, labels),
        "DeleteFavorite",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteFavorite - status code is 200": (r) =>
            r.status === 200,
        "DeleteFavorite - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
