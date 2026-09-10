#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "@babel/parser";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2] || ".";
const EXCEPTIONS_FILE = path.join(
    SCRIPT_DIR,
    "k6-check-exceptions.json",
);

const EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
]);

const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
]);

let filesScanned = 0;
let checksFound = 0;
let dynamicChecksFound = 0;
let allowedChecksFound = 0;
let violationsFound = 0;

const usedExceptions = new Set();

function loadExceptions() {
    if (!fs.existsSync(EXCEPTIONS_FILE)) {
        return {};
    }

    return JSON.parse(
        fs.readFileSync(EXCEPTIONS_FILE, "utf8"),
    );
}

const exceptions = loadExceptions();

function getFiles(dir) {
    const files = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (IGNORE_DIRS.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
            continue;
        }

        if (EXTENSIONS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function isCheckCall(node) {
    return (
        node?.type === "CallExpression" &&
        node.callee?.type === "Identifier" &&
        node.callee.name === "check"
    );
}

function isObjectExpression(node) {
    return node?.type === "ObjectExpression";
}

function sourceForNode(node) {
    if (!node) {
        return "<unknown>";
    }

    if (node.type === "TemplateLiteral") {
        let result = "`";

        node.quasis.forEach((quasi, index) => {
            result += quasi.value.raw;

            if (index < node.expressions.length) {
                result += "${";
                result += sourceForNode(node.expressions[index]);
                result += "}";
            }
        });

        return result + "`";
    }

    if (node.type === "Identifier") {
        return node.name;
    }

    if (node.type === "StringLiteral") {
        return JSON.stringify(node.value);
    }

    if (node.type === "NumericLiteral") {
        return String(node.value);
    }

    if (node.type === "BinaryExpression") {
        return (
            sourceForNode(node.left) +
            ` ${node.operator} ` +
            sourceForNode(node.right)
        );
    }

    if (node.type === "CallExpression") {
        return `${sourceForNode(node.callee)}(...)`;
    }

    return `<${node.type}>`;
}

function getRelativeFile(file) {
    return path.relative(process.cwd(), file);
}

function getExceptionKey(file, name) {
    return `${getRelativeFile(file)}::${name}`;
}

function isException(file, name) {
    const relativeFile = getRelativeFile(file);
    const fileExceptions = exceptions[relativeFile];

    if (!fileExceptions) {
        return false;
    }

    const allowed = fileExceptions.includes(name);

    if (allowed) {
        usedExceptions.add(
            getExceptionKey(file, name),
        );
    }

    return allowed;
}

function analyzeFile(file) {
    filesScanned++;

    const source = fs.readFileSync(file, "utf8");

    let ast;

    try {
        ast = parse(source, {
            sourceType: "unambiguous",
            plugins: [
                "jsx",
                "typescript",
            ],
        });
    } catch (error) {
        console.error(`⚠️  Could not parse ${file}`);
        console.error(`   ${error.message}`);
        return;
    }

    walk(ast.program, file);
}

function walk(node, file) {
    if (!node || typeof node !== "object") {
        return;
    }

    if (isCheckCall(node)) {
        analyzeCheck(node, file);
    }

    for (const key of Object.keys(node)) {
        if (
            key === "loc" ||
            key === "start" ||
            key === "end" ||
            key === "tokens" ||
            key === "comments"
        ) {
            continue;
        }

        const value = node[key];

        if (Array.isArray(value)) {
            for (const child of value) {
                walk(child, file);
            }
        } else if (value && typeof value === "object") {
            walk(value, file);
        }
    }
}

function analyzeCheck(node, file) {
    checksFound++;

    const checkObject = node.arguments?.find(isObjectExpression);

    if (!checkObject) {
        return;
    }

    for (const property of checkObject.properties || []) {
        if (property.type !== "ObjectProperty") {
            continue;
        }

        if (!property.computed) {
            continue;
        }

        dynamicChecksFound++;

        const loc = property.loc?.start || node.loc?.start;
        const name = sourceForNode(property.key);

        if (isException(file, name)) {
            allowedChecksFound++;

            // console.log("⚠️  Allowed dynamic k6 check name");
        } else {
            violationsFound++;

            console.log("❌ Dynamic k6 check name");
        }

        console.log(`   File: ${getRelativeFile(file)}`);
        console.log(`   Line: ${loc.line}`);
        console.log(`   Column: ${loc.column + 1}`);
        console.log(`   Name: ${name}`);
        console.log();
    }
}

function reportUnusedExceptions() {
    let unusedCount = 0;

    for (const [file, names] of Object.entries(exceptions)) {
        for (const name of names) {
            const key = `${file}::${name}`;

            if (usedExceptions.has(key)) {
                continue;
            }

            unusedCount++;

            console.log("⚠️  Unused exception");
            console.log(`   File: ${file}`);
            console.log(`   Name: ${name}`);
            console.log();
        }
    }

    return unusedCount;
}

const files = getFiles(ROOT);

for (const file of files) {
    analyzeFile(file);
}

const unusedExceptions = reportUnusedExceptions();

console.log("========================================");
console.log("k6 check analysis");
console.log("========================================");
console.log(`Files scanned:          ${filesScanned}`);
console.log(`check() calls found:    ${checksFound}`);
console.log(`Dynamic check names:    ${dynamicChecksFound}`);
console.log(`Allowed exceptions:     ${allowedChecksFound}`);
console.log(`Violations:             ${violationsFound}`);
console.log(`Unused exceptions:      ${unusedExceptions}`);
console.log("========================================");

// Fail CI for either actual violations or stale exceptions.
process.exitCode =
    violationsFound > 0 || unusedExceptions > 0
        ? 1
        : 0;
