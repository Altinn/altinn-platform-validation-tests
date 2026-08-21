// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link GetSentRequests}.
 *
 * Use {@link GetSentRequestsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSentRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 * @property {string} [type] Request type to filter by.
 */

/**
 * Query parameters for {@link GetSentResourceRequests}.
 *
 * Use {@link GetSentResourceRequestsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSentResourceRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetSentPackageRequests}.
 *
 * Use {@link GetSentPackageRequestsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSentPackageRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetReceivedRequests}.
 *
 * Use {@link GetReceivedRequestsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetReceivedRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 * @property {string} [type] Request type to filter by.
 */

/**
 * Query parameters for {@link GetReceivedResourceRequests}.
 *
 * Use {@link GetReceivedResourceRequestsQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} GetReceivedResourceRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetReceivedPackageRequests}.
 *
 * Use {@link GetReceivedPackageRequestsQueryBuilder} to construct this object.
 *
 * @typedef {object} GetReceivedPackageRequestsQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetSentRequestsCount}.
 *
 * Use {@link GetSentRequestsCountQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSentRequestsCountQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetReceivedRequestsCount}.
 *
 * Use {@link GetReceivedRequestsCountQueryBuilder} to construct this object.
 *
 * @typedef {object} GetReceivedRequestsCountQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [from] Party UUID the access is given from.
 * @property {Array<RequestStatus>} [status] Request statuses to filter by.
 */

/**
 * Query parameters for {@link GetRequest}.
 *
 * Use {@link GetRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} GetRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 */

/**
 * Query parameters for {@link CreateResourceRequest}.
 *
 * Use {@link CreateResourceRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateResourceRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [resource] Resource identifier.
 */

/**
 * Query parameters for {@link CreatePackageRequest}.
 *
 * Use {@link CreatePackageRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} CreatePackageRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [to] Party UUID the access is given to.
 * @property {string} [package] Access package URN.
 */

/**
 * Query parameters for {@link WithdrawSentRequest}.
 *
 * Use {@link WithdrawSentRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} WithdrawSentRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [id] Request UUID.
 */

/**
 * Query parameters for {@link ConfirmDraftRequest}.
 *
 * Use {@link ConfirmDraftRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} ConfirmDraftRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [id] Request UUID.
 */

/**
 * Query parameters for {@link RejectReceivedRequest}.
 *
 * Use {@link RejectReceivedRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} RejectReceivedRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [id] Request UUID.
 */

/**
 * Query parameters for {@link ApproveReceivedRequest}.
 *
 * Use {@link ApproveReceivedRequestQueryBuilder} to construct this object.
 *
 * @typedef {object} ApproveReceivedRequestQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [id] Request UUID.
 */

export const ApproveReceivedRequestQuery = undefined;
export const ConfirmDraftRequestQuery = undefined;
export const CreatePackageRequestQuery = undefined;
export const CreateResourceRequestQuery = undefined;
export const GetReceivedPackageRequestsQuery = undefined;
export const GetReceivedRequestsCountQuery = undefined;
export const GetReceivedRequestsQuery = undefined;
export const GetReceivedResourceRequestsQuery = undefined;
export const GetRequestQuery = undefined;
export const GetSentPackageRequestsQuery = undefined;
export const GetSentRequestsCountQuery = undefined;
export const GetSentRequestsQuery = undefined;
export const GetSentResourceRequestsQuery = undefined;
export const RejectReceivedRequestQuery = undefined;
export const WithdrawSentRequestQuery = undefined;
