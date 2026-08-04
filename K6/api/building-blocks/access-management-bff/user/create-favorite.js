import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Adds an actor to the favourites of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} partyUuid Party UUID of the actor.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the actor was added to the favourites.
 */
export function CreateFavorite(userClient, partyUuid, labels = null) {
    const res = userClient.CreateFavorite(partyUuid, labels);

    let added = false;

    const succeed = check(res, {
        "CreateFavorite - status code is 200": (r) =>
            r.status === 200,
        "CreateFavorite - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return added;
    }

    added = true;

    return added;
}
