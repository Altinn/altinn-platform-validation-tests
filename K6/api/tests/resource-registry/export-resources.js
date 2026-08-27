import { ResourceClient } from "../../../clients/resource-registry/index.js";
import { requireEnv } from "../../../helpers.js";
import { ResourceExport } from "../../building-blocks/resource-registry/resource/index.js";
import { RdfExportDomainChecks } from "../../domain-checks/resource-registry/rdf-export.js";

// The media type the endpoint promises through [Produces] in the registry. Note
// that the body is actually Turtle and not RDF/XML, so the test checks the
// header the service declares and reads the body as Turtle.
const EXPECTED_MEDIA_TYPE = "application/xml+rdf";

// The vocabularies the registry writes the catalogue in. cpsv and cv carry the
// service and the competent authority, dct carries identifier, title and
// description.
const EXPECTED_PREFIXES = ["rdf", "rdfs", "dct", "cv", "cpsv"];

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the whole resource catalogue can be exported as RDF.
 *
 * The endpoint is public, so the client is built without a token generator. It is
 * the only operation in the registry that answers with something other than
 * JSON, so the media type is checked alongside the body.
 *
 * The body is not parsed. A full RDF parser in k6 is not worth it, so the checks
 * hold the document to the prefixes it declares and to one identifier per
 * resource it describes.
 */
export default function () {
    const resourceClient = new ResourceClient(__ENV.BASE_URL);

    const exported = ResourceExport(resourceClient);

    RdfExportDomainChecks.CheckMediaType(exported, EXPECTED_MEDIA_TYPE, "ResourceExport");
    RdfExportDomainChecks.CheckPrefixesDeclared(exported, EXPECTED_PREFIXES, "ResourceExport");
    RdfExportDomainChecks.CheckEveryResourceIsIdentified(exported, "ResourceExport");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
