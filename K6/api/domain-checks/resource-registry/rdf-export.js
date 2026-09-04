import { check } from "k6";
import http from "k6/http";

/**
 * Checks the media type of a download.
 *
 * The export is the only operation in the registry that answers with something
 * other than JSON, so the media type is part of the contract and not just a
 * header.
 *
 * @param {http.RefinedResponse<"text">|null} response - The response returned by the API.
 * @param {string} expectedMediaType - Media type the response has to start with.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if the media type matches, false otherwise.
 */
function CheckMediaType(response, expectedMediaType, operation) {
    const contentType = response?.headers?.["Content-Type"] ?? "";

    const success = check(response, {
        "CheckMediaType - The response answers with the expected media type": () =>
            contentType.startsWith(expectedMediaType),
    });

    if (!success) {
        console.error(`CheckMediaType - ${operation} answered with Content-Type '${contentType}', expected it to start with '${expectedMediaType}'`);
    }

    return success;
}

/**
 * Checks that the document declares the namespace prefixes it is written in.
 *
 * A body that is empty, truncated or an error page in disguise fails here, which
 * is as far as we go without an RDF parser.
 *
 * @param {http.RefinedResponse<"text">|null} response - The response returned by the API.
 * @param {Array<string>} expectedPrefixes - Prefix names the document has to declare.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if every prefix is declared, false otherwise.
 */
function CheckPrefixesDeclared(response, expectedPrefixes, operation) {
    const body = response?.body ?? "";
    const missing = expectedPrefixes.filter((prefix) => !body.includes(`@prefix ${prefix}:`));

    const success = check(response, {
        "CheckPrefixesDeclared - Every expected prefix is declared": () =>
            missing.length === 0,
    });

    if (!success) {
        console.error(`CheckPrefixesDeclared - prefixes missing from ${operation}: ${JSON.stringify(missing)}`);
        console.error(`CheckPrefixesDeclared - first 200 characters of the body: ${body.slice(0, 200)}`);
    }

    return success;
}

/**
 * Checks that the document describes resources, and that every resource it
 * describes carries an identifier.
 *
 * The registry writes one subject per resource, with a dct:identifier and a
 * cpsv:PublicService type on each. Counting the two against each other catches a
 * document that is well formed but has lost the identifiers, which a plain
 * "body is not empty" check would let through.
 *
 * @param {http.RefinedResponse<"text">|null} response - The response returned by the API.
 * @param {string} operation - Name of the operation, used in the logs.
 * @returns {boolean} True if the counts match and are above zero, false otherwise.
 */
function CheckEveryResourceIsIdentified(response, operation) {
    const body = response?.body ?? "";
    const identifiers = (body.match(/dct:identifier/g) ?? []).length;
    const publicServices = (body.match(/a cpsv:PublicService/g) ?? []).length;

    const success = check(response, {
        "CheckEveryResourceIsIdentified - Every resource carries an identifier": () =>
            publicServices > 0 && identifiers === publicServices,
    });

    if (!success) {
        console.error(`CheckEveryResourceIsIdentified - ${operation} described ${publicServices} resource(s) with ${identifiers} identifier(s)`);
    }

    return success;
}

export const RdfExportDomainChecks = {
    CheckMediaType,
    CheckPrefixesDeclared,
    CheckEveryResourceIsIdentified,
};
