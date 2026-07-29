import { check } from "k6";

import { SignClient } from "../../../clients/storage/index.js";

/**
 * Creates a signature for data elements of an instance.
 *
 * @param {SignClient} signClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {SignRequest} request Signature request.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse} The response, which has no documented body.
 */
export function SignInstance(
    signClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = signClient.SignInstance(
        instanceOwnerPartyId,
        instanceGuid,
        request,
        labels,
    );

    const success = check(res, {
        "SignInstance - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}
