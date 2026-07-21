import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Exports all resources as RDF/XML.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} RDF/XML document.
 */
export function ResourceExport(
    resourceClient,
    labels = null,
) {
    const res = resourceClient.ResourceExport(labels);

    /** @type {string|null} */
    let rdf = null;

    const succeed = check(res, {
        "ResourceExport - status code is 200": (r) =>
            r.status === 200,
        "ResourceExport - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rdf;
    }

    check(res, {
        "ResourceExport - body is present": (r) => {
            rdf = r.body;

            return rdf !== null;
        },
    });

    return rdf;
}
