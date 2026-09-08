
import { check } from "k6";

import { SystemUserClient } from "../../../../clients/authentication/index.js";
import { SystemUserUpdateDto } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates an existing SystemUser.
 *
 * Without a caller on purpose. PUT /systemuser answers 500 for every caller today,
 * so the test that covered it is gone rather than parked, and this stays so the test
 * only has to be written again and not the plumbing under it. The same goes for
 * SystemUserUpdateDtoBuilder, which builds the payload this takes.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {SystemUserUpdateDto} request Update payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether update succeeded.
 */
export function SystemUserUpdate(
    systemUserClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.SystemUserUpdate(request, labels),
        "SystemUserUpdate",
    );

    return check(res, {
        "SystemUserUpdate - status code is 200": (r) =>
            r.status === 200,
    });
}
