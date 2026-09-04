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

const TAG_KEYS = new Set(["endpoint", "name"]);

/**
 * Finds the variable a name refers to, from the innermost scope outwards.
 *
 * @param {import("eslint").Scope.Scope|null} scope Where the name is read.
 * @param {string} name The name to look up.
 * @returns {import("eslint").Scope.Variable|null} The variable, or null when it
 * is a global such as `URL`.
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
 * @param {import("eslint").Scope.Variable|null} variable The variable a tag reads.
 * @returns {boolean} True when it is fixed for the run rather than per call.
 */
function isFixedForTheRun(variable) {
    if (variable === null) {
        return true;
    }

    return variable.scope.type === "module" || variable.scope.type === "global";
}

/**
 * @param {import("estree").Node} node The tag value, or a part of it.
 * @param {import("eslint").Scope.Scope} scope The scope the value is written in.
 * @returns {boolean} True when nothing in the value can differ between calls.
 */
function isStatic(node, scope) {
    switch (node.type) {
        case "Literal":
            return typeof node.value === "string";

        case "ThisExpression":
            return true;

        case "Identifier":
            return isFixedForTheRun(resolve(scope, node.name));

        case "TemplateLiteral":
            return node.expressions.every((expression) => isStatic(expression, scope));

        case "BinaryExpression":
            return node.operator === "+"
                && isStatic(node.left, scope)
                && isStatic(node.right, scope);

        case "MemberExpression":
            return isStatic(node.object, scope)
                && (!node.computed || isStatic(node.property, scope));

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

                const isTagObject =
                    properties.some((property) => property.key.name === "action")
                    || (node.parent.type === "Property"
                        && node.parent.key.type === "Identifier"
                        && node.parent.key.name === "tags");

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
