/**
 * Counts the identifier and service statements in the registry's Turtle export.
 *
 * Skip literals, IRIs and comments before counting, so resource text cannot be
 * mistaken for a predicate. This is a smoke check for the registry's output,
 * not a Turtle parser or validation of each individual subject.
 *
 * @param {string} body The Turtle document.
 * @returns {{identifiers: number, publicServices: number}} Statement counts.
 */
export function countRdfStatements(body) {
    const statements = body.replace(
        /"""(?:\\[\s\S]|(?!""")[^\\])*"""|'''(?:\\[\s\S]|(?!''')[^\\])*'''|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|<[^>]*>|#[^\r\n]*/g,
        " ",
    );

    return {
        identifiers: (statements.match(/(?:^|[\s;])dct:identifier(?=\s)/g) ?? []).length,
        publicServices: (statements.match(/(?:^|[\s;])a\s+cpsv:PublicService(?=[\s.;]|$)/g) ?? []).length,
    };
}
