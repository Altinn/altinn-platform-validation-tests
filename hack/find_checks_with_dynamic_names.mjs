#!/usr/bin/env node

// Fails when a k6 check() name is not a plain string.
//
// Check names become labels in Grafana. A name built at run time, from an id, a
// status or an operation, splits one check into many series, so every name must be
// written out in full where check() is called. Values that help diagnose a failure
// belong in the failure log instead.
//
// Usage: node hack/find_checks_with_dynamic_names.mjs [directory]   (default: K6)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "@babel/parser";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, "K6"));

const EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts"]);
const IGNORE_DIRS = new Set(["node_modules", ".git"]);

let filesScanned = 0;
let checksFound = 0;

/** @type {{file: string, line: number, column: number, message: string}[]} */
const violations = [];

function getFiles(dir) {
    const files = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (IGNORE_DIRS.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
        } else if (EXTENSIONS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function relativeToRepo(file) {
    return path.relative(REPO_ROOT, file).split(path.sep).join("/");
}

function report(file, node, message) {
    violations.push({
        file: relativeToRepo(file),
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        message,
    });
}

/**
 * Finds the names check() goes by in a file: `check` itself, any alias it is
 * imported from k6 under, and any name the k6 module itself is imported as.
 *
 * @param {object} program - The parsed file.
 * @returns {{functions: Set<string>, namespaces: Set<string>}} The names to match calls on.
 */
function findCheckBindings(program) {
    const functions = new Set(["check"]);
    const namespaces = new Set();

    for (const statement of program.body) {
        if (statement.type !== "ImportDeclaration" || statement.source.value !== "k6") {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type === "ImportSpecifier") {
                const imported = specifier.imported.name ?? specifier.imported.value;
                if (imported === "check") {
                    functions.add(specifier.local.name);
                }
            } else {
                namespaces.add(specifier.local.name);
            }
        }
    }

    return { functions, namespaces };
}

function isCheckCall(node, bindings) {
    if (node.type !== "CallExpression") {
        return false;
    }

    const callee = node.callee;

    if (callee.type === "Identifier") {
        return bindings.functions.has(callee.name);
    }

    if (callee.type !== "MemberExpression" || callee.object.type !== "Identifier") {
        return false;
    }

    const property = callee.computed ? callee.property.value : callee.property.name;

    return bindings.namespaces.has(callee.object.name) && property === "check";
}

function isStaticKey(property) {
    if (!property.computed) {
        return true;
    }

    const key = property.key;

    return key.type === "StringLiteral" ||
        (key.type === "TemplateLiteral" && key.expressions.length === 0);
}

function analyzeCheck(node, file, source) {
    checksFound++;

    const names = node.arguments[1];

    if (names?.type !== "ObjectExpression") {
        report(file, node, "check() names must be an object literal written at the call");
        return;
    }

    for (const property of names.properties) {
        if (property.type === "SpreadElement") {
            report(file, property, `check() names must not be spread in: ${source.slice(property.start, property.end)}`);
        } else if (!isStaticKey(property)) {
            report(file, property, `check() name is not a plain string: ${source.slice(property.key.start, property.key.end)}`);
        }
    }
}

function walk(node, visit) {
    if (!node || typeof node !== "object") {
        return;
    }

    if (Array.isArray(node)) {
        node.forEach((child) => walk(child, visit));
        return;
    }

    if (typeof node.type === "string") {
        visit(node);
    }

    for (const [key, value] of Object.entries(node)) {
        if (key !== "loc" && key !== "extra" && value && typeof value === "object") {
            walk(value, visit);
        }
    }
}

function analyzeFile(file) {
    filesScanned++;

    const source = fs.readFileSync(file, "utf8");
    let ast;

    try {
        ast = parse(source, {
            sourceType: "unambiguous",
            plugins: path.extname(file) === ".ts" ? ["typescript"] : [],
        });
    } catch (error) {
        // A file that cannot be read cannot be shown to be clean.
        violations.push({
            file: relativeToRepo(file),
            line: error.loc?.line ?? 1,
            column: (error.loc?.column ?? 0) + 1,
            message: `could not parse: ${error.message}`,
        });
        return;
    }

    const bindings = findCheckBindings(ast.program);

    walk(ast.program, (node) => {
        if (isCheckCall(node, bindings)) {
            analyzeCheck(node, file, source);
        }
    });
}

for (const file of getFiles(ROOT)) {
    analyzeFile(file);
}

for (const violation of violations) {
    console.log(`${violation.file}:${violation.line}:${violation.column}  ${violation.message}`);
}

console.log();
console.log(`Files scanned:       ${filesScanned}`);
console.log(`check() calls found: ${checksFound}`);
console.log(`Violations:          ${violations.length}`);

process.exitCode = violations.length > 0 ? 1 : 0;
