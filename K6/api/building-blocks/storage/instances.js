import { check } from "k6";

import { InstancesClient } from "../../../clients/storage/index.js";
import { DataValues, Instance, InstanceQueryResponse, PresentationTexts, Substatus } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Queries instances across applications.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {{[key: string]: *}} query Optional query parameters.
 * @param {string} instanceOwnerIdentifier Value for the X-Ai-InstanceOwnerIdentifier header.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {InstanceQueryResponse|null} Parsed response body, or null when the call failed.
 */
export function QueryInstances(
    instancesClient,
    query = null,
    instanceOwnerIdentifier = null,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.QueryInstances(
            query,
            instanceOwnerIdentifier,
            labels,
        ),
        "QueryInstances",
    );

    /** @type {InstanceQueryResponse|null} */
    let instances = null;

    const success = check(res, {
        "QueryInstances - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instances;
    }

    check(res, {
        "QueryInstances - body is valid": (r) => {
            try {
                instances = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instances;
}

/**
 * Creates an instance of an application.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {Instance} request Instance to create.
 * @param {string} appId Application id, e.g. ttd/my-app.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function CreateInstance(
    instancesClient,
    request,
    appId = null,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.CreateInstance(
            request,
            appId,
            labels,
        ),
        "CreateInstance",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "CreateInstance - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "CreateInstance - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Gets an instance by its guid alone.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function GetInstanceByGuid(
    instancesClient,
    instanceGuid,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.GetInstanceByGuid(
            instanceGuid,
            labels,
        ),
        "GetInstanceByGuid",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "GetInstanceByGuid - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "GetInstanceByGuid - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Gets an instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function GetInstance(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.GetInstance(
            instanceOwnerPartyId,
            instanceGuid,
            labels,
        ),
        "GetInstance",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "GetInstance - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "GetInstance - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Deletes an instance. Responds with 200 and the instance, or 204 when hard deleted.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {boolean} hard Whether to hard delete.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} The deleted instance on a soft delete, or null on a
 * hard delete, which answers 204, and when the call failed.
 */
export function DeleteInstance(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    hard = null,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.DeleteInstance(
            instanceOwnerPartyId,
            instanceGuid,
            hard,
            labels,
        ),
        "DeleteInstance",
    );

    /** @type {Instance|null} */
    let instance = null;

    // A soft delete answers 200 with the instance, a hard delete answers 204.
    const success = check(res, {
        "DeleteInstance - status code is 200 or 204": (r) =>
            r.status === 200 || r.status === 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    if (res.status === 204) {
        return instance;
    }

    check(res, {
        "DeleteInstance - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Marks an instance as completely confirmed by the application owner.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function CompleteInstance(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.CompleteInstance(
            instanceOwnerPartyId,
            instanceGuid,
            labels,
        ),
        "CompleteInstance",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "CompleteInstance - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "CompleteInstance - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Replaces the data values of an instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {DataValues} request Data values to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdateDataValues(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.UpdateDataValues(
            instanceOwnerPartyId,
            instanceGuid,
            request,
            labels,
        ),
        "UpdateDataValues",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdateDataValues - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdateDataValues - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Replaces the presentation texts of an instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {PresentationTexts} request Presentation texts to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdatePresentationTexts(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.UpdatePresentationTexts(
            instanceOwnerPartyId,
            instanceGuid,
            request,
            labels,
        ),
        "UpdatePresentationTexts",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdatePresentationTexts - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdatePresentationTexts - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Sets the read status of an instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} status Read status to set.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdateReadStatus(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    status = null,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.UpdateReadStatus(
            instanceOwnerPartyId,
            instanceGuid,
            status,
            labels,
        ),
        "UpdateReadStatus",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdateReadStatus - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdateReadStatus - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Sets the substatus of an instance.
 *
 * @param {InstancesClient} instancesClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {Substatus} request Substatus to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdateSubStatus(
    instancesClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instancesClient.UpdateSubStatus(
            instanceOwnerPartyId,
            instanceGuid,
            request,
            labels,
        ),
        "UpdateSubStatus",
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdateSubStatus - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdateSubStatus - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}
