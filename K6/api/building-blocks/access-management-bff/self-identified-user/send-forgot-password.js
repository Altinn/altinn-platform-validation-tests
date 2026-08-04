import { check } from "k6";

import { SelfIdentifiedUserClient } from "../../../../../clients/access-management-bff/self-identified-user/index.js";

/**
 * Starts password recovery for a self identified Altinn 2 account.
 *
 * @param {SelfIdentifiedUserClient} selfIdentifiedUserClient Client for the
 * self identified user endpoints.
 * @param {Altinn2ForgotPasswordRequest|null} [body] The account to recover the
 * password for. Use {@link Altinn2ForgotPasswordRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the password recovery was started.
 */
export function SendForgotPassword(
    selfIdentifiedUserClient,
    body = null,
    labels = null,
) {
    const res = selfIdentifiedUserClient.SendForgotPassword(body, labels);

    let sent = false;

    const succeed = check(res, {
        "SendForgotPassword - status code is 200": (r) =>
            r.status === 200,
        "SendForgotPassword - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return sent;
    }

    sent = true;

    return sent;
}
