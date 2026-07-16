import { check } from "k6";

import { FavoritesClient } from "../../../../clients/favorites/index.js";

/**
 * Adds a party to the favorites group for the current user.
 *
 * @param {FavoritesClient} favoritesClient Client for the Favorites API.
 * @param {string} partyUuid Party UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the party was successfully added or was already a favorite.
 */
export function AddFavorite(
    favoritesClient,
    partyUuid,
    labels = null,
) {
    const res = favoritesClient.AddFavorite(
        partyUuid,
        labels,
    );

    let added = false;

    const succeed = check(res, {
        "AddFavorite - status code is 201 or 204": (r) =>
            r.status === 201 || r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return added;
    }

    added = true;

    return added;
}
