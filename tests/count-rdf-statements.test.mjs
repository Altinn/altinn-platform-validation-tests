import assert from "node:assert/strict";
import test from "node:test";

import { countRdfStatements } from "../K6/api/domain-checks/resource-registry/count-rdf-statements.js";

const resource = '<urn:resource> dct:identifier "id"; a cpsv:PublicService.';

test("counts resource statements", () => {
    assert.deepEqual(countRdfStatements(resource), { identifiers: 1, publicServices: 1 });
    assert.deepEqual(countRdfStatements(""), { identifiers: 0, publicServices: 0 });
});

test("ignores predicate names in titles, descriptions, IRIs and comments", () => {
    const literals = [
        '"Dokumentasjon av dct:identifier"@nb',
        '"a cpsv:PublicService"',
        String.raw`"escaped \" dct:identifier and a cpsv:PublicService"`,
        "'dct:identifier and a cpsv:PublicService'",
        '"""A multiline\ndct:identifier and a cpsv:PublicService"""',
        "'''A multiline\ndct:identifier and a cpsv:PublicService'''",
    ];
    for (const literal of literals) {
        assert.deepEqual(countRdfStatements(`${resource}\n<urn:title> dct:title ${literal}.`),
            { identifiers: 1, publicServices: 1 });
    }
    assert.deepEqual(countRdfStatements(`${resource}\n<urn:dct:identifier> dct:relation <urn:other#fragment>.\n# dct:identifier a cpsv:PublicService`),
        { identifiers: 1, publicServices: 1 });
});

test("a title cannot hide a missing identifier or service type", () => {
    assert.deepEqual(countRdfStatements('<urn:resource> dct:title "dct:identifier"; a cpsv:PublicService.'),
        { identifiers: 0, publicServices: 1 });
    assert.deepEqual(countRdfStatements('<urn:resource> dct:identifier "id"; dct:title "a cpsv:PublicService".'),
        { identifiers: 1, publicServices: 0 });
});

test("accepts whitespace between type tokens and ignores longer names", () => {
    assert.deepEqual(countRdfStatements('<urn:resource> dct:identifier "id"; a\n cpsv:PublicService .'),
        { identifiers: 1, publicServices: 1 });
    assert.deepEqual(countRdfStatements('<urn:resource> dct:identifierExtra "id"; a cpsv:PublicServiceExtra.'),
        { identifiers: 0, publicServices: 0 });
});
