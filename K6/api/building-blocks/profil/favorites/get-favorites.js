import { check } from "k6";

import { FavoritesClient } from "../../../../clients/favorites/index.js";

/**
 * Gets the favorite parties for the current user.
 *
 * @param {FavoritesClient} favoritesClient Client for the Favorites API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {GroupResponse|null} Favorite parties group.
 */
export function GetFavorites(
    favoritesClient,
    labels = null,
) {
    const res = favoritesClient.GetFavorites(labels);

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "GetFavorites - status code is 200": (r) =>
            r.status === 200,
        "GetFavorites - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "GetFavorites - body is valid": (r) => {
            try {
                group = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return group;
}
