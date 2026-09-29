import { ResourcePolicyRightsQuery } from "./types.js";

/**
 * Builds the query for the decomposed policy rights of a resource. Both
 * flags default to false in the registry.
 */
class ResourcePolicyRightsQueryBuilder {
    constructor() {
        this.query = /** @type {ResourcePolicyRightsQuery} */ ({});
    }

    /**
     * Whether the rights the service owner keeps for itself are decomposed too.
     *
     * @param {boolean} include True to include them.
     * @returns {ResourcePolicyRightsQueryBuilder} This builder, for chaining.
     */
    withServiceOwnerRights(include) {
        this.query.includeServiceOwnerRights = include;

        return this;
    }

    /**
     * Whether app rights are included.
     *
     * @param {boolean} include True to include them.
     * @returns {ResourcePolicyRightsQueryBuilder} This builder, for chaining.
     */
    withAppRights(include) {
        this.query.includeAppRights = include;

        return this;
    }

    /**
     * @returns {ResourcePolicyRightsQuery} The query.
     */
    build() {
        return { ...this.query };
    }
}

export { ResourcePolicyRightsQueryBuilder };
