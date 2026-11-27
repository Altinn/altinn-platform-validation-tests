import { check } from "k6";

import { CreateAdministratorQuery } from "../../../../clients/access-management-bff/bankruptcy-estate/bankruptcy-estate.types.js";
import { BankruptcyEstateClient } from "../../../../clients/access-management-bff/bankruptcy-estate/index.js";
import { AssignmentDto, PersonInput } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds an administrator to a bankruptcy estate.
 *
 * @param {BankruptcyEstateClient} bankruptcyEstateClient Client for the bankruptcy estate
 * endpoints.
 * @param {PersonInput} body The person to add as administrator. Use
 * {@link PersonInputBuilder}.
 * @param {CreateAdministratorQuery|null} [queryParams] Optional query parameters. Use
 * {@link CreateAdministratorQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentDto|null} The created assignment.
 */
export function CreateAdministrator(
    bankruptcyEstateClient,
    body,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => bankruptcyEstateClient.CreateAdministrator(body, queryParams, labels),
        "CreateAdministrator",
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateAdministrator - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateAdministrator - body is valid": (r) => {
            try {
                assignment = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignment;
}
