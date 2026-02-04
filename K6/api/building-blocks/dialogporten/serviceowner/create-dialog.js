import { check } from "k6";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 
 */
export function CreateDialog(
    serviceOwnerApiClient,
    endUser,
    serviceResource,
    serviceOwner,
    label = null,
    noTransmissionsActivities = false,
    title = null,
) {
    const res = serviceOwnerApiClient.PostDialog(
        endUser,
        serviceResource,
        serviceOwner,
        label,
        noTransmissionsActivities,
        title
    );

    const success = check(res, {
        "CreateDialog - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

export function CreateTransmission(
    serviceOwnerApiClient,
    dialogId,
    label = null,
) {
    const res = serviceOwnerApiClient.PostTransmission(
        dialogId,
        label,
    );

    const success = check(res, {
        "CreateTransmission - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

export function CreateActivity(
    serviceOwnerApiClient,
    dialogId,
    label = null,
) {
    const res = serviceOwnerApiClient.PostActivity(
        dialogId,
        label,
    );

    const success = check(res, {
        "CreateActivity - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
