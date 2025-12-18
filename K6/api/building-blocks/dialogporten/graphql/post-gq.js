import { check } from "k6";
import { GraphQLApiClient } from "../../../../clients/dialogporten/graphql/index.js";

/**
 * @param {GraphQLApiClient} graphQLApiClient
 * @param { object } body
 * @returns (string | ArrayBuffer | null)
 */
export function PostGQ(
    graphQLApiClient,
    body,
    label = null
) {
    const res = graphQLApiClient.PostGQ(
        body,
        label
    );
    /*
    const success = check(res, {
        "PostGQ - status code MUST be 204": (res) => res.status == 204,
        "PostGQ - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }
    */
    return res.body;
}
