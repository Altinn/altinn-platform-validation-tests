import { check } from "k6";

import { SelfIdentifiedUserClient } from "../../../../clients/access-management-bff/self-identified-user/index.js";

/**
 * Creates a self identified Altinn 2 account.
 *
 * @param {SelfIdentifiedUserClient} selfIdentifiedUserClient Client for the
 * self identified user endpoints.
 * @param {Altinn2AccountRequest|null} [body] The account to create. Use
 * {@link Altinn2AccountRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the account was created.
 */
export function CreateAltinn2Account(
    selfIdentifiedUserClient,
    body = null,
    labels = null,
) {
    const res = selfIdentifiedUserClient.CreateAltinn2Account(body, labels);

    let created = false;

    const succeed = check(res, {
        "CreateAltinn2Account - status code is 200": (r) =>
            r.status === 200,
        "CreateAltinn2Account - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return created;
    }

    created = true;

    return created;
}
