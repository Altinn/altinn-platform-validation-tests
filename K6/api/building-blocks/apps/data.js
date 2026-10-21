import { check } from "k6";

import { DataClient } from "../../../clients/apps/index.js";
import { DataElement } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Replaces the content of a data element with the given form data.
 *
 * The app answers 201 with the data element, or 200 when its calculations
 * changed the data that was sent. Both mean the data was stored.
 *
 * @param {DataClient} dataClient Client for the API.
 * @param {string} org The service owner of the app.
 * @param {string} app The app name.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {{[key: string]: *}} formData The data model, as JSON.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function Put(
    dataClient,
    org,
    app,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    formData,
    labels = null,
) {
    const res = withRetries(
        () => dataClient.Put(
            org,
            app,
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            formData,
            labels,
        ),
        "Put",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "Put - status code is 201 or 200": (r) => r.status === 201 || r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "Put - body is valid": (r) => {
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
