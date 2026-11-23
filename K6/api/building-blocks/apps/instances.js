import { check } from "k6";

import { AppProcessState, InstanceWrite, ProcessNext } from "../../../clients/apps/apps.types.js";
import { InstancesClient } from "../../../clients/apps/index.js";
import { Instance } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Parses the body of a response, as a check.
 *
 * @param {string} name The name of the building block, for the check.
 * @param {import("k6/http").RefinedResponse<"text">} res The response.
 * @returns {*} The parsed body, or null when it could not be parsed.
 */
function parseBody(name, res) {
    let body = null;

    check(res, {
        [`${name} - body is valid`]: (r) => {
            try {
                body = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return body;
}

/**
 * Create new instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {string} org The service owner of the app.
 * @param {string} app The app name.
 * @param {InstanceWrite} instance The instance document, which names the instance owner.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function CreateNewInstance(
    instancesClient,
    org,
    app,
    instance,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.CreateNewInstance(
            org,
            app,
            instance,
            labels,
        ),
        "CreateNewInstance",
    );

    const success = check(res, {
        "CreateNewInstance - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return null;
    }

    return parseBody("CreateNewInstance", res);
}

/**
 * Move instance to next process step.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {string} org The service owner of the app.
 * @param {string} app The app name.
 * @param {string} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {ProcessNext|null} [processNext] Optional action to perform.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {AppProcessState|null} Parsed response body, or null when the call failed.
 */
export function MoveInstanceToNextProcessStep(
    instancesClient,
    org,
    app,
    instanceOwnerPartyId,
    instanceGuid,
    processNext = null,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.MoveInstanceToNextProcessStep(
            org,
            app,
            instanceOwnerPartyId,
            instanceGuid,
            processNext,
            labels,
        ),
        "MoveInstanceToNextProcessStep",
    );

    const success = check(res, {
        "MoveInstanceToNextProcessStep - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return null;
    }

    return parseBody("MoveInstanceToNextProcessStep", res);
}
