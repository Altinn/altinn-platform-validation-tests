/**
 * The optimistic concurrency headers the Storage write operations take. Both
 * are optional; a write without them is unconditional.
 *
 * @typedef {object} VersionMatch
 * @property {string|null} [ifInstanceVersionMatch] Expected aggregate instance version, sent as `If-Instance-Version-Match`.
 * @property {string|null} [ifProcessStateVersionMatch] Expected process-state version, sent as `If-Process-State-Version-Match`.
 */

/**
 * The headers for a VersionMatch, with the ones not given left null so
 * requestParams drops them.
 *
 * @param {VersionMatch|null} versionMatch The versions the write is conditioned on, or null for none.
 * @returns {{"If-Instance-Version-Match": string|null, "If-Process-State-Version-Match": string|null}} The headers.
 */
export function versionMatchHeaders(versionMatch) {
    return {
        "If-Instance-Version-Match": versionMatch?.ifInstanceVersionMatch ?? null,
        "If-Process-State-Version-Match": versionMatch?.ifProcessStateVersionMatch ?? null,
    };
}

// Runtime stub, so the typedef can be imported where it is documented.
export const VersionMatch = undefined;
