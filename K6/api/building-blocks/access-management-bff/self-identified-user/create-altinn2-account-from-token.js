import { check } from "k6";

import { Altinn2AccountFromTokenRequest } from "../../../../clients/access-management-bff/common/common.types.js";
import { SelfIdentifiedUserClient } from "../../../../clients/access-management-bff/self-identified-user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a self identified Altinn 2 account from a one time token.
 *
 * @param {SelfIdentifiedUserClient} selfIdentifiedUserClient Client for the
 * self identified user endpoints.
 * @param {Altinn2AccountFromTokenRequest|null} [body] The token to create the
 * account from. Use {@link Altinn2AccountFromTokenRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the account was created.
 */
export function CreateAltinn2AccountFromToken(
    selfIdentifiedUserClient,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => selfIdentifiedUserClient.CreateAltinn2AccountFromToken(
            body,
            labels,
        ),
        "CreateAltinn2AccountFromToken",
    );

    let created = false;

    const succeed = check(res, {
        "CreateAltinn2AccountFromToken - status code is 200": (r) =>
            r.status === 200,
        "CreateAltinn2AccountFromToken - status text is 200 OK": (r) =>
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
