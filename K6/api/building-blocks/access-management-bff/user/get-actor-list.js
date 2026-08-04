import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Gets the actor list of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<Connection>|null} The actor list.
 */
export function GetActorList(userClient, labels = null) {
    const res = userClient.GetActorList(labels);

    /** @type {Array<Connection>|null} */
    let actorList = null;

    const succeed = check(res, {
        "GetActorList - status code is 200": (r) =>
            r.status === 200,
        "GetActorList - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return actorList;
    }

    check(res, {
        "GetActorList - body is valid": (r) => {
            try {
                actorList = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return actorList;
}
