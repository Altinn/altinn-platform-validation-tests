/**
 * Builder for GroupRequest.
 */
class GroupRequestBuilder {
    constructor() {
        /** @type {GroupRequest} */
        this.request = {};
    }

    /**
     * Sets the group name.
     *
     * @param {string} name The group name.
     * @returns {GroupRequestBuilder} TODO: Description
     */
    withName(name) {
        if (typeof name !== "string") {
            throw new Error("name must be a string.");
        }

        if (name.length < 1) {
            throw new Error("name must contain at least 1 character.");
        }

        this.request.name = name;

        return this;
    }

    /**
     * Builds the request.
     *
     * @returns {GroupRequest} TODO: Description
     */
    build() {
        if (!this.request.name) {
            throw new Error("name is required.");
        }

        return this.request;
    }
}

export {
    GroupRequestBuilder,
};
