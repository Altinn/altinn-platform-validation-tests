import { check } from "k6";

import { URL } from "../../../common-imports.js";

/**
 * @typedef {import("../../../clients/resource-registry/types.js").ServiceResource} ServiceResource
 * @typedef {import("../../../clients/resource-registry/types.js").ContactPoint} ContactPoint
 */

/**
 * The export names every service under the prod host, whatever environment it
 * comes from.
 */
const SERVICE_IRI_BASE = "https://platform.altinn.no/resourceRegistry/";

/**
 * The statements of one subject in the Turtle export, or null when the subject
 * is not in it. Every subject starts on a line of its own with its IRI, so the
 * statements run until the next line that starts with one.
 *
 * @param {string} rdf - The Turtle document.
 * @param {string} iri - The subject IRI.
 * @returns {string|null} The statements, or null when the subject is missing.
 */
function subjectStatements(rdf, iri) {
    const start = rdf.indexOf(`\n<${iri}> `);

    if (start === -1) {
        return null;
    }

    const end = rdf.indexOf("\n<", start + 1);

    return rdf.slice(start, end === -1 ? undefined : end);
}

/**
 * @param {string} value - The literal value.
 * @returns {string} The value as a Turtle string literal.
 */
function turtleLiteral(value) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
}

/**
 * The contact page the way the registry writes it: an absolute http(s) URL,
 * normalised like .NET does, or null when it is not one.
 *
 * @param {string|null} contactPage - The stored contact page.
 * @returns {string|null} The IRI, or null when the export skips it.
 */
function contactPageIri(contactPage) {
    try {
        const url = new URL((contactPage ?? "").trim());

        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch (err) {
        return null;
    }
}

/**
 * The statements the export should hold for a stored contact point, or an empty
 * list when nothing in it is usable and the export leaves it out.
 *
 * @param {ContactPoint} contactPoint - The stored contact point.
 * @returns {Array<string>} The expected statements.
 */
function expectedContactPointStatements(contactPoint) {
    const category = contactPoint.category?.trim();
    const email = contactPoint.email?.trim();
    const telephone = contactPoint.telephone?.trim();
    const contactPage = contactPageIri(contactPoint.contactPage);

    if (!category && !email && !telephone && contactPage === null) {
        return [];
    }

    return [
        "a cv:ContactPoint",
        ...(category ? [`vcard:category ${turtleLiteral(category)}@nb`] : []),
        ...(email ? [`cv:email ${turtleLiteral(email)}`] : []),
        ...(telephone ? [`cv:telephone ${turtleLiteral(telephone)}`] : []),
        ...(contactPage !== null ? [`cv:contactPage <${contactPage}>`] : []),
    ];
}

/**
 * Every contact point the registry stores on an exported service comes out as a
 * cv:ContactPoint with its category, email, telephone and contact page, numbered
 * by its place in the stored list. A contact point with nothing usable in it, or
 * a contact page that is not an http(s) URL, is left out rather than failing the
 * export.
 *
 * Services the export leaves out, such as Maskinporten schemas and system
 * resources, are not looked at.
 *
 * @param {string|null} rdf - The Turtle document returned by the export.
 * @param {Array<ServiceResource>|null} resources - The resources as the registry stores them.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if every contact point is exported as stored, false otherwise.
 */
function CheckContactPointsExported(rdf, resources, operation) {
    /** @type {Array<string>} */
    const wrong = [];
    let compared = 0;

    for (const resource of resources ?? []) {
        const serviceIri = `${SERVICE_IRI_BASE}${resource.identifier}`;
        const service = subjectStatements(rdf ?? "", serviceIri);

        if (service === null) {
            continue;
        }

        (resource.contactPoints ?? []).forEach((contactPoint, index) => {
            if (contactPoint === null) {
                return;
            }

            const contactPointIri = `${serviceIri}/contactpoint/${index}`;
            const expected = expectedContactPointStatements(contactPoint);
            const exported = subjectStatements(/** @type {string} */ (rdf), contactPointIri);
            const linked = service.includes(`<${contactPointIri}>`);

            if (expected.length === 0) {
                if (exported !== null || linked) {
                    wrong.push(`${contactPointIri}: has nothing usable but is exported`);
                }
                return;
            }

            compared++;

            if (exported === null || !linked) {
                wrong.push(`${contactPointIri}: missing, stored as ${JSON.stringify(contactPoint)}`);
                return;
            }

            const missing = expected.filter((statement) => !exported.includes(statement));
            const unexpectedPage = contactPageIri(contactPoint.contactPage) === null && exported.includes("cv:contactPage");

            if (missing.length > 0 || unexpectedPage) {
                wrong.push(`${contactPointIri}: expected ${JSON.stringify(expected)}, exported ${exported.trim()}`);
            }
        });
    }

    const success = check(rdf, {
        "CheckContactPointsExported - Every stored contact point is exported as a cv:ContactPoint": () =>
            compared > 0 && wrong.length === 0,
    });

    if (!success) {
        console.error(`CheckContactPointsExported - ${operation} compared ${compared} contact point(s), ${wrong.length} wrong`);
        wrong.forEach((line) => console.error(`CheckContactPointsExported - ${line}`));
    }

    return success;
}

export const RdfExportDomainChecks = {
    CheckContactPointsExported,
};
