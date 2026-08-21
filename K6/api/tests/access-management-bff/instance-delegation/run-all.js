import runOrgToUser, { setup as setupOrgToUser } from "./org-to-user.js";
import runUserToUser, { setup as setupUserToUser } from "./user-to-user.js";

/**
 * k6 setup stage. Runs the setup each test in the folder brings, keeping the
 * results apart so a test still gets exactly the data it declared.
 *
 * @returns {object} One entry per setup, keyed by the file it came from.
 */
export function setup() {
    return {
        orgToUser: setupOrgToUser(),
        userToUser: setupUserToUser(),
    };
}

/**
 * Runs every test in this folder once, in one k6 run, so a change to the shared
 * clients, building blocks or checks can be verified in one go.
 *
 * @param {object} data Setup results, keyed per setup.
 */
export default function (data) {
    runOrgToUser(data.orgToUser);
    runUserToUser(data.userToUser);
}
