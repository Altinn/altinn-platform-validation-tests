import { ActivityLogDirection, ActivityLogFilterValueOrder, ActivityLogFilterValuesQuery, ActivityLogType } from "./activity-log.types.js";

/**
 * Builds the query of `GET /activitylog` and `GET /activitylog/filter/{field}`.
 *
 * The keys are camelCase, like the other enduser clients. The Swagger spells
 * them PascalCase; the API accepts both.
 */
class ActivityLogQueryBuilder {
    constructor() {
        this.query = /** @type {ActivityLogFilterValuesQuery} */ ({});
    }

    /**
     * Required party the log is read for.
     *
     * @param {string} party Party UUID.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Direction of the activities, seen from the party. The Swagger marks it
     * optional, but the API answers 400 or 403 without it.
     *
     * @param {ActivityLogDirection} direction Direction.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withDirection(direction) {
        this.query.direction = direction;
        return this;
    }

    /**
     * Optional activity type filter.
     *
     * @param {Array<ActivityLogType>} type Activity types.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Optional filter on activity types, by the ids `GET /activitylog/types`
     * lists. Several ids match an entry of any of them.
     *
     * @param {Array<string>} typeId Activity type UUIDs.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withTypeId(typeId) {
        this.query.typeId = typeId;
        return this;
    }

    /**
     * Optional filter on who performed the activity.
     *
     * @param {Array<string>} by Party UUIDs.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withBy(by) {
        this.query.by = by;
        return this;
    }

    /**
     * Optional filter on the party the activity came from.
     *
     * @param {Array<string>} from Party UUIDs.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional filter on the party the activity went to.
     *
     * @param {Array<string>} to Party UUIDs.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional lower time bound.
     *
     * @param {string} after ISO date-time.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withAfter(after) {
        this.query.after = after;
        return this;
    }

    /**
     * Optional upper time bound.
     *
     * @param {string} before ISO date-time.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withBefore(before) {
        this.query.before = before;
        return this;
    }

    /**
     * Optional page size. The API defaults to 100.
     *
     * @param {number} pageSize Page size.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withPageSize(pageSize) {
        this.query.pageSize = pageSize;
        return this;
    }

    /**
     * Optional page number.
     *
     * @param {number} pageNo Page number.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withPageNo(pageNo) {
        this.query.pageNo = pageNo;
        return this;
    }

    /**
     * Optional search term. Only used by `GET /activitylog/filter/{field}`.
     *
     * @param {string} term Search term.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withTerm(term) {
        this.query.term = term;
        return this;
    }

    /**
     * Optional ordering of the filter values. Only used by
     * `GET /activitylog/filter/{field}`.
     *
     * @param {ActivityLogFilterValueOrder} orderBy Order.
     * @returns {ActivityLogQueryBuilder} This builder, for chaining.
     */
    withOrderBy(orderBy) {
        this.query.orderBy = orderBy;
        return this;
    }

    /**
     * @returns {ActivityLogFilterValuesQuery} The built query.
     */
    build() {
        return this.query;
    }
}

export { ActivityLogQueryBuilder };
