import { RequestStatus } from "../common/common.types.js";
import { ApproveReceivedRequestQuery, ConfirmDraftRequestQuery, CreatePackageRequestQuery, CreateResourceRequestQuery, GetReceivedPackageRequestsQuery, GetReceivedRequestsCountQuery, GetReceivedRequestsQuery, GetReceivedResourceRequestsQuery, GetRequestQuery, GetSentPackageRequestsQuery, GetSentRequestsCountQuery, GetSentRequestsQuery, GetSentResourceRequestsQuery, RejectReceivedRequestQuery, WithdrawSentRequestQuery } from "./request.types.js";

/**
 * Builder for the query parameters of {@link GetSentRequests}.
 */
class GetSentRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSentRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetSentRequestsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetSentRequestsQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetSentRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional. Request type to filter by.
     *
     * @param {string} type Request type to filter by.
     * @returns {GetSentRequestsQueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSentRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSentResourceRequests}.
 */
class GetSentResourceRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSentResourceRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetSentResourceRequestsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetSentResourceRequestsQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetSentResourceRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSentResourceRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSentPackageRequests}.
 */
class GetSentPackageRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSentPackageRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetSentPackageRequestsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetSentPackageRequestsQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetSentPackageRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSentPackageRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetReceivedRequests}.
 */
class GetReceivedRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional. Request type to filter by.
     *
     * @param {string} type Request type to filter by.
     * @returns {GetReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetReceivedRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetReceivedResourceRequests}.
 */
class GetReceivedResourceRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetReceivedResourceRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetReceivedResourceRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetReceivedResourceRequestsQueryBuilder} This builder, for
     * chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetReceivedResourceRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetReceivedResourceRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetReceivedPackageRequests}.
 */
class GetReceivedPackageRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetReceivedPackageRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetReceivedPackageRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetReceivedPackageRequestsQueryBuilder} This builder, for
     * chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetReceivedPackageRequestsQueryBuilder} This builder, for
     * chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetReceivedPackageRequestsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSentRequestsCount}.
 */
class GetSentRequestsCountQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSentRequestsCountQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetSentRequestsCountQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetSentRequestsCountQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetSentRequestsCountQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSentRequestsCountQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetReceivedRequestsCount}.
 */
class GetReceivedRequestsCountQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetReceivedRequestsCountQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetReceivedRequestsCountQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Request statuses to filter by. Can be called more than once.
     *
     * @param {RequestStatus} statu Request statuses to filter by.
     * @returns {GetReceivedRequestsCountQueryBuilder} This builder, for chaining.
     */
    addStatu(statu) {
        this.query.status ??= [];
        this.query.status.push(statu);
        return this;
    }

    /**
     * Request statuses to filter by. Replaces any previous values.
     *
     * @param {Array<RequestStatus>} status Request statuses to filter by.
     * @returns {GetReceivedRequestsCountQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetReceivedRequestsCountQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetRequest}.
 */
class GetRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateResourceRequest}.
 */
class CreateResourceRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateResourceRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {CreateResourceRequestQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateResourceRequestQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateResourceRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreatePackageRequest}.
 */
class CreatePackageRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreatePackageRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {CreatePackageRequestQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Access package URN.
     *
     * @param {string} packageUrn Access package URN.
     * @returns {CreatePackageRequestQueryBuilder} This builder, for chaining.
     */
    withPackage(packageUrn) {
        this.query.package = packageUrn;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreatePackageRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link WithdrawSentRequest}.
 */
class WithdrawSentRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {WithdrawSentRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Request UUID.
     *
     * @param {string} id Request UUID.
     * @returns {WithdrawSentRequestQueryBuilder} This builder, for chaining.
     */
    withId(id) {
        this.query.id = id;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {WithdrawSentRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link ConfirmDraftRequest}.
 */
class ConfirmDraftRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {ConfirmDraftRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Request UUID.
     *
     * @param {string} id Request UUID.
     * @returns {ConfirmDraftRequestQueryBuilder} This builder, for chaining.
     */
    withId(id) {
        this.query.id = id;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ConfirmDraftRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link RejectReceivedRequest}.
 */
class RejectReceivedRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {RejectReceivedRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Request UUID.
     *
     * @param {string} id Request UUID.
     * @returns {RejectReceivedRequestQueryBuilder} This builder, for chaining.
     */
    withId(id) {
        this.query.id = id;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {RejectReceivedRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link ApproveReceivedRequest}.
 */
class ApproveReceivedRequestQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {ApproveReceivedRequestQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Request UUID.
     *
     * @param {string} id Request UUID.
     * @returns {ApproveReceivedRequestQueryBuilder} This builder, for chaining.
     */
    withId(id) {
        this.query.id = id;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ApproveReceivedRequestQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    ApproveReceivedRequestQueryBuilder,
    ConfirmDraftRequestQueryBuilder,
    CreatePackageRequestQueryBuilder,
    CreateResourceRequestQueryBuilder,
    GetReceivedPackageRequestsQueryBuilder,
    GetReceivedRequestsCountQueryBuilder,
    GetReceivedRequestsQueryBuilder,
    GetReceivedResourceRequestsQueryBuilder,
    GetRequestQueryBuilder,
    GetSentPackageRequestsQueryBuilder,
    GetSentRequestsCountQueryBuilder,
    GetSentRequestsQueryBuilder,
    GetSentResourceRequestsQueryBuilder,
    RejectReceivedRequestQueryBuilder,
    WithdrawSentRequestQueryBuilder,
};
