import { check } from "k6";

import { DataClient } from "../../../clients/storage/index.js";
import { DataElement, DataElementList, FileScanStatus } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Uploads a new data element to an instance.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {*} body Binary file content.
 * @param {string} dataType Data type id.
 * @param {Array<string>} refs Ids of related data elements.
 * @param {string} generatedFromTask Task the element was generated from.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function CreateData(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    body,
    dataType = null,
    refs = null,
    generatedFromTask = null,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.CreateData(
            instanceOwnerPartyId,
            instanceGuid,
            body,
            dataType,
            refs,
            generatedFromTask,
            labels,
        ),
        "CreateData",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "CreateData - status code is 201": (r) => r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "CreateData - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}

/**
 * Downloads the content of a data element.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">} The HTTP response. The body is the file
 * content, so the response is returned rather than a boolean.
 */
export function GetData(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.GetData(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            labels,
        ),
        "GetData",
    );

    const success = check(res, {
        "GetData - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}

/**
 * Replaces the content of a data element.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {*} body Binary file content.
 * @param {Array<string>} refs Ids of related data elements.
 * @param {string} generatedFromTask Task the element was generated from.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function UpdateData(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    body,
    refs = null,
    generatedFromTask = null,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.UpdateData(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            body,
            refs,
            generatedFromTask,
            labels,
        ),
        "UpdateData",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "UpdateData - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "UpdateData - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}

/**
 * Deletes a data element.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {boolean} delay Whether to delay the delete.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function DeleteData(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    delay = null,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.DeleteData(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            delay,
            labels,
        ),
        "DeleteData",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "DeleteData - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "DeleteData - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}

/**
 * Gets the data elements of an instance.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {DataElementList|null} Parsed response body, or null when the call failed.
 */
export function GetDataElements(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.GetDataElements(
            instanceOwnerPartyId,
            instanceGuid,
            labels,
        ),
        "GetDataElements",
    );

    /** @type {DataElementList|null} */
    let dataElements = null;

    const success = check(res, {
        "GetDataElements - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElements;
    }

    check(res, {
        "GetDataElements - body is valid": (r) => {
            try {
                dataElements = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElements;
}

/**
 * Replaces the metadata of a data element.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {DataElement} request Data element metadata to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function UpdateDataElement(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.UpdateDataElement(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            request,
            labels,
        ),
        "UpdateDataElement",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "UpdateDataElement - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "UpdateDataElement - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}

/**
 * Sets the file scan status of a data element.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {FileScanStatus} request File scan status to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the call succeeded.
 */
export function UpdateFileScanStatus(
    dataClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.UpdateFileScanStatus(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            request,
            labels,
        ),
        "UpdateFileScanStatus",
    );

    const success = check(res, {
        "UpdateFileScanStatus - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
