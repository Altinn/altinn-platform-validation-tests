import { check } from "k6";

import { FavoritesClient } from "../../../../clients/profil/favorites/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a party from the favorites group for the current user.
 *
 * @param {FavoritesClient} favoritesClient Client for the Favorites API.
 * @param {string} partyUuid Party UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the party was successfully removed.
 */
export function DeleteFavorite(
    favoritesClient,
    partyUuid,
    labels = null,
) {
    const res = withRetries(
        () => favoritesClient.DeleteFavorite(
            partyUuid,
            labels,
        ),
        "DeleteFavorite",
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteFavorite - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
