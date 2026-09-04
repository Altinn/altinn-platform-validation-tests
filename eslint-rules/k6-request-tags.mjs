/**
 * Keeps the `endpoint` and `name` request tags free of per-call values.
 *
 * Every tag value opens its own timeseries, so a party uuid or a query
 * parameter in one of these tags splits one endpoint into a series per value,
 * and the panel that should show one line for `GET /parties/{partyUuid}` shows
 * thousands of them. The URL carries the values, the tags carry the shape:
 *
 *     const url = new URL(`${this.FULL_PATH}/${partyUuid}/customers`);
 *
 *     url.searchParams.set("fields", fields.join(","));
 *
 *     let tags = {
 *         endpoint: `${this.FULL_PATH}/{partyUuid}/customers`,
 *         name: `${this.FULL_PATH}/{partyUuid}/customers`,
 *         action: TAGS.GetCustomers.action,
 *     };
 *
 * So a tag may read whatever is fixed for the run, such as a property on the
 * client or a module constant, and nothing that is bound inside the method: no
 * parameter, no local, and no call, since a call can hand back anything. That
 * is the line the bug this rule exists for crossed. The tag pointed at the same
 * `url` variable the method later appended a query string to, so the tag
 * followed the query without anyone having to write it there.
 */

const TAG_KEYS = new Set(["endpoint", "name", "action"]);

/**
 * Finds the variable a name refers to, from the innermost scope outwards.
 *
 * @param {import("eslint").Scope.Scope|null} scope Where the name is read.
 * @param {string} name The name to look up.
 * @returns {import("eslint").Scope.Variable|null} The variable, or null when
 * nothing in scope declares it, such as a global.
 */
function resolve(scope, name) {
    for (let current = scope; current !== null; current = current.upper) {
        const found = current.variables.find((variable) => variable.name === name);

        if (found) {
            return found;
        }
    }

    return null;
}

/**
 * What a name was declared as, when it was declared somewhere a tag may read.
 *
 * A module-level `const` is the only declaration a tag may read, and only for
 * what it was initialized to: module scope runs once per VU, so a `const` set
 * from `uuidv4()` holds a different value in every VU, and a tag reading it
 * opens a series per VU. An import is taken on trust, since the value is not in
 * this file to look at, which is how a tag reads a URL out of a config module.
 *
 * @param {import("eslint").Scope.Variable|null} variable The variable a tag reads.
 * @returns {import("estree").Node|"import"|null} What it was initialized to,
 * "import" when the value is not in this file to look at, and null when a tag
 * may not read it.
 */
function declaration(variable) {
    if (variable === null || variable.defs.length !== 1) {
        return null;
    }

    const [definition] = variable.defs;

    if (definition.type === "ImportBinding" || definition.type === "ClassName") {
        return "import";
    }

    const scope = variable.scope.type;

    if (
        definition.type !== "Variable"
        || definition.parent.kind !== "const"
        || (scope !== "module" && scope !== "global")
    ) {
        return null;
    }

    return definition.node.init ?? null;
}

/**
 * Follows a member expression to the value it reads.
 *
 * `TAGS.GetCustomers.action` lands on the string in the object literal `TAGS`
 * was initialized to, and `config.tokenUrl` lands on "import" when config came
 * from one.
 *
 * @param {import("estree").Node} node The member expression.
 * @param {import("eslint").Scope.Scope} scope The scope it is read in.
 * @returns {import("estree").Node|"import"|null} The value it reads, "import"
 * when it comes from one, and null when it cannot be followed.
 */
function follow(node, scope) {
    /** @type {string[]} */
    const path = [];

    let current = node;
    while (current.type === "MemberExpression") {
        if (current.computed || current.property.type !== "Identifier") {
            return null;
        }

        path.unshift(current.property.name);
        current = current.object;
    }

    if (current.type === "ThisExpression") {
        return "import";
    }

    if (current.type !== "Identifier") {
        return null;
    }

    // The environment is read once and holds for the run. `__VU` and `__ITER`
    // are not, which is why this names the one global a tag may read instead of
    // trusting every global.
    if (current.name === "__ENV") {
        return "import";
    }

    let value = declaration(resolve(scope, current.name));

    for (const step of path) {
        if (value === "import") {
            return "import";
        }

        if (value === null || value.type !== "ObjectExpression") {
            return null;
        }

        const property = value.properties.find(
            (candidate) =>
                candidate.type === "Property"
                && candidate.key.type === "Identifier"
                && candidate.key.name === step,
        );

        if (!property) {
            return null;
        }

        value = property.value;
    }

    return value;
}

/**
 * @param {import("estree").Node} node The tag value, or a part of it.
 * @param {import("eslint").Scope.Scope} scope The scope the value is written in.
 * @param {Set<import("estree").Node>} [seen] Values already followed, so a
 * `const` that reads another one cannot send this around in a circle.
 * @returns {boolean} True when nothing in the value can differ between calls.
 */
function isStatic(node, scope, seen = new Set()) {
    if (seen.has(node)) {
        return false;
    }

    seen.add(node);

    switch (node.type) {
        case "Literal":
            return typeof node.value === "string";

        case "TemplateLiteral":
            return node.expressions.every(
                (expression) => isStatic(expression, scope, seen),
            );

        case "BinaryExpression":
            return node.operator === "+"
                && isStatic(node.left, scope, seen)
                && isStatic(node.right, scope, seen);

        case "Identifier": {
            const value = declaration(resolve(scope, node.name));

            return value === "import"
                || (value !== null && isStatic(value, scope, seen));
        }

        case "ThisExpression":
            return true;

        case "MemberExpression": {
            const value = follow(node, scope);

            return value === "import"
                || (value !== null && isStatic(value, scope, seen));
        }

        default:
            return false;
    }
}

/**
 * @param {import("eslint").Rule.RuleContext} context The rule context.
 * @param {import("estree").Node} node The node to read.
 * @returns {string} The source text of the node.
 */
function text(context, node) {
    return context.sourceCode.getText(node);
}

/** @type {import("eslint").Rule.RuleModule} */
const staticRequestTags = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Keep per-call values out of the endpoint and name request tags, so identical calls report to one timeseries",
        },
        schema: [],
        messages: {
            dynamic:
                "`{{value}}` can differ between calls, and every value it takes opens its own timeseries for the {{key}} tag. Put the values in the URL and `{placeholders}` in the tag, or read something that is fixed for the run.",
            shorthand:
                "The {{key}} tag reads the `{{key}}` variable, which can differ between calls and opens a timeseries per value. Write the path out with `{placeholders}` and put the values in the URL.",
            mismatch:
                "The endpoint and name tags must hold the same path, or the same call reports under two names. endpoint is `{{endpoint}}` and name is `{{name}}`.",
            assigned:
                "The {{key}} tag is already set where the tags are built. Writing it again here is how a query string ends up in a tag, and with it one timeseries per value.",
        },
    },

    create(context) {
        return {
            ObjectExpression(node) {
                const properties = node.properties.filter(
                    (property) =>
                        property.type === "Property" && property.key.type === "Identifier",
                );

                const named = new Set(properties.map((property) => property.key.name));

                // `action` on its own is a payload field in plenty of places, an
                // XACML request among them, so a tag object has to look like one:
                // an action together with a path, or the tags of a request.
                const isTagObject =
                    (named.has("action") && (named.has("endpoint") || named.has("name")))
                    || (node.parent.type === "Property"
                        && node.parent.key.type === "Identifier"
                        && node.parent.key.name === "tags")
                    || (node.parent.type === "VariableDeclarator"
                        && node.parent.id.type === "Identifier"
                        && node.parent.id.name === "tags");

                if (!isTagObject) {
                    return;
                }

                const tags = properties.filter((property) => TAG_KEYS.has(property.key.name));

                for (const tag of tags) {
                    const key = tag.key.name;

                    if (tag.shorthand) {
                        context.report({ node: tag, messageId: "shorthand", data: { key } });
                        continue;
                    }

                    if (!isStatic(tag.value, context.sourceCode.getScope(tag.value))) {
                        context.report({
                            node: tag,
                            messageId: "dynamic",
                            data: { key, value: text(context, tag.value) },
                        });
                    }
                }

                const endpoint = tags.find((tag) => tag.key.name === "endpoint");
                const name = tags.find((tag) => tag.key.name === "name");

                if (
                    endpoint
                    && name
                    && !endpoint.shorthand
                    && !name.shorthand
                    && text(context, endpoint.value) !== text(context, name.value)
                ) {
                    context.report({
                        node: name,
                        messageId: "mismatch",
                        data: {
                            endpoint: text(context, endpoint.value),
                            name: text(context, name.value),
                        },
                    });
                }
            },

            AssignmentExpression(node) {
                const target = node.left;

                if (
                    target.type !== "MemberExpression"
                    || target.property.type !== "Identifier"
                    || !TAG_KEYS.has(target.property.name)
                    || target.object.type !== "MemberExpression"
                    || target.object.property.type !== "Identifier"
                    || target.object.property.name !== "tags"
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "assigned",
                    data: { key: target.property.name },
                });
            },
        };
    },
};

export default {
    rules: {
        "static-request-tags": staticRequestTags,
    },
};
