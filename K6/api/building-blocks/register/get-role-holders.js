import { check } from "k6";

import { RegisterClient } from "../../../clients/register/index.js";
import {
    Party,
    PartyFieldInclude,
} from "../../../clients/register/types.js";
import { withRetries } from "../common/retry.js";

/**
 * Gets the holders of one of a party's Enhetsregisteret roles: the parties it has
 * assigned that role to.
 *
 * The role is part of the check names, so a test that reads holders for more than
 * one role can tell which of them failed.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {string} partyUuid The party that assigned the role.
 * @param {string} ccrRole The role that was assigned, from CcrHolderRoles.
 * @param {Array<PartyFieldInclude>} [fields] The party fields to include.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<Party>|null} The parties holding the role, or null on failure.
 */
export function GetRoleHolders(
    registerClient,
    partyUuid,
    ccrRole,
    fields = null,
    labels = null,
) {
    const res = withRetries(
        () => registerClient.GetRoleHolders(partyUuid, ccrRole, fields, labels),
        `GetRoleHolders(${ccrRole})`,
    );

    /** @type {Array<Party>|null} */
    let holders = null;

    const succeed = check(res, {
        [`GetRoleHolders(${ccrRole}) - status code is 200`]: (r) =>
            r.status === 200,
        [`GetRoleHolders(${ccrRole}) - status text is 200 OK`]: (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return holders;
    }

    check(res, {
        [`GetRoleHolders(${ccrRole}) - body is valid`]: (r) => {
            try {
                holders = JSON.parse(r.body).data ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return holders;
}
