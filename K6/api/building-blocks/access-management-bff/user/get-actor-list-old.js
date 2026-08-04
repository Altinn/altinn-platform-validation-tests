import { check } from "k6";

import { UserClient } from "../../../../../clients/access-management-bff/user/index.js";

/**
 * Gets the actor list of the authenticated user in the Altinn 2 format.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AuthorizedParty>|null} The actor list.
 */
export function GetActorListOld(userClient, labels = null) {
    const res = userClient.GetActorListOld(labels);

    /** @type {Array<AuthorizedParty>|null} */
    let actorList = null;

    const succeed = check(res, {
        "GetActorListOld - status code is 200": (r) =>
            r.status === 200,
        "GetActorListOld - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return actorList;
    }

    check(res, {
        "GetActorListOld - body is valid": (r) => {
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
