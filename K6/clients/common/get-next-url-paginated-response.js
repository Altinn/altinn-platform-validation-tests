import http from "k6/http";

/**
 * Fetch a fully-qualified `links.next` URL using a bearer token.
 *
 * This is intentionally generic: **only** `token` + `nextUrl`.
 *
 * @param {string} token
 * @param {string} nextUrl Fully qualified URL to fetch (typically from `links.next`)
 * @returns {import("k6/http").RefinedResponse}
 */
export function getNextUrlPaginatedResponse(token, nextUrl) {
    const params = {
        tags: { name: "next-url" },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };

    return http.get(nextUrl, params);
}
