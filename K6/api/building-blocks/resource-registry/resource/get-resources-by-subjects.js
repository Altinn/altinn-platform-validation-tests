import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets resources connected to subjects.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {Array<string>} subjects List of subjects for resource information.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SubjectResourcesPaginated|null} Resources grouped by subject.
 */
export function ResourceGetResourcesBySubjects(
    resourceClient,
    subjects,
    labels = null,
) {
    const res = resourceClient.ResourceGetResourcesBySubjects(
        subjects,
        labels,
    );

    /** @type {SubjectResourcesPaginated|null} */
    let subjectResources = null;

    const succeed = check(res, {
        "ResourceGetResourcesBySubjects - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetResourcesBySubjects - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subjectResources;
    }

    check(res, {
        "ResourceGetResourcesBySubjects - body is valid": (r) => {
            try {
                subjectResources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return subjectResources;
}
